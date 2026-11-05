import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Loader2, Send, Check, CheckCheck, Pencil, Trash2, X, Eraser } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchMessageContacts,
  fetchMessages,
  markMessagesRead,
  sendMessage,
  updateMessage,
  deleteMessage,
  clearConversation,
  clearAllMessages,
} from '../../services/messageService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import PageShell from '../../components/ui/PageShell';
import UserAvatar from '../../components/common/UserAvatar';
import {
  DEMO_MESSAGING_CONVERSATION,
  DEMO_MESSAGING_CONVERSATION_RECRUTEUR,
  DEMO_MESSAGING_CONTACTS_CANDIDAT,
  DEMO_MESSAGING_CONTACTS_RECRUTEUR,
} from '../../constants/demoCatalog';
import {
  DEMO_CONTACT_IDS,
  dismissDemoMessaging,
  isDemoMessagingDismissed,
} from '../../utils/demoMessaging';

function partnerUser(conv) {
  if (!conv) return null;
  return {
    prenom: conv.prenom,
    nom: conv.nom,
    role: conv.role,
    photo_url: conv.photo_url,
    photo_profil: conv.photo_url,
  };
}

function formatNow() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function MessageriePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const messagesScrollRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [contenu, setContenu] = useState('');
  const [newDestinataire, setNewDestinataire] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [clearing, setClearing] = useState(false);

  const scrollMessagesToBottom = () => {
    const el = messagesScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const demoConversation = user?.role === 'recruteur' ? DEMO_MESSAGING_CONVERSATION_RECRUTEUR : DEMO_MESSAGING_CONVERSATION;

  const loadApi = async () => {
    setLoading(true);
    const role = user?.role || 'candidat';
    const demoDismissed = isDemoMessagingDismissed(role);
    const allDefaultContacts = role === 'recruteur' ? DEMO_MESSAGING_CONTACTS_RECRUTEUR : DEMO_MESSAGING_CONTACTS_CANDIDAT;
    const defaultContacts = demoDismissed
      ? allDefaultContacts.filter((c) => !DEMO_CONTACT_IDS.includes(c.id_user))
      : allDefaultContacts;
    const toParam = searchParams.get('to');
    try {
      const [{ conversations: convs }, contactList] = await Promise.all([
        fetchMessages(),
        fetchMessageContacts(),
      ]);
      if (convs.length > 0) {
        setConversations(convs);
        if (toParam) {
          const targetId = Number(toParam);
          setSelectedId(convs.some((c) => c.id_user === targetId) ? targetId : convs[0].id_user);
        } else {
          setSelectedId((prev) => (prev && convs.some((c) => c.id_user === prev) ? prev : convs[0].id_user));
        }
      } else if (!demoDismissed) {
        setConversations([demoConversation]);
        setSelectedId(toParam ? Number(toParam) || demoConversation.id_user : demoConversation.id_user);
      } else {
        setConversations([]);
        setSelectedId(null);
      }
      if (contactList.length > 0) {
        setContacts([...defaultContacts, ...contactList]);
      } else {
        setContacts(defaultContacts);
      }
    } catch {
      if (!demoDismissed) {
        setConversations([demoConversation]);
        setSelectedId(toParam ? Number(toParam) || demoConversation.id_user : demoConversation.id_user);
      } else {
        setConversations([]);
        setSelectedId(null);
      }
      setContacts(defaultContacts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApi();
  }, [searchParams, user?.role]);

  const selectedConv = conversations.find((c) => c.id_user === selectedId) ?? null;
  const partner = partnerUser(selectedConv);
  const isDemoChat = selectedConv?.id_user === demoConversation.id_user;

  useEffect(() => {
    if (selectedId && !isDemoChat) {
      markMessagesRead(selectedId).catch(() => {});
    }
    requestAnimationFrame(scrollMessagesToBottom);
  }, [selectedId, selectedConv?.messages?.length, isDemoChat]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setNewDestinataire(String(id));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = contenu.trim();
    if (!text) return;

    const dest = selectedId || Number(newDestinataire);
    if (!dest) return;

    setSending(true);
    setError('');

    if (isDemoChat || dest === demoConversation.id_user) {
      const newMsg = {
        id_message: `demo-${Date.now()}`,
        contenu: text,
        date_label: formatNow(),
        is_mine: true,
        lu: true,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id_user === demoConversation.id_user
            ? { ...c, messages: [...c.messages, newMsg] }
            : c
        )
      );
      setContenu('');
      toast.success('Message envoyé.');
      requestAnimationFrame(scrollMessagesToBottom);
      setSending(false);
      return;
    }

    try {
      await sendMessage(dest, text);
      setContenu('');
      toast.success('Message envoyé.');
      await loadApi();
      requestAnimationFrame(scrollMessagesToBottom);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const updateConvMessages = (partnerId, updater) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id_user === partnerId
          ? { ...c, messages: updater(c.messages) }
          : c
      )
    );
  };

  const startEdit = (message) => {
    setEditingId(message.id_message);
    setEditText(message.contenu);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (message) => {
    const text = editText.trim();
    if (!text) return;

    const isDemo = String(message.id_message).startsWith('demo-');
    if (isDemo || isDemoChat) {
      updateConvMessages(selectedId, (msgs) =>
        msgs.map((m) =>
          m.id_message === message.id_message ? { ...m, contenu: text } : m
        )
      );
      cancelEdit();
      toast.success('Message modifié.');
      return;
    }

    try {
      await updateMessage(message.id_message, text);
      updateConvMessages(selectedId, (msgs) =>
        msgs.map((m) =>
          m.id_message === message.id_message ? { ...m, contenu: text } : m
        )
      );
      cancelEdit();
      toast.success('Message modifié.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const removeMessage = async (message) => {
    if (!window.confirm('Supprimer ce message ?')) return;

    const isDemo = String(message.id_message).startsWith('demo-');
    if (isDemo || isDemoChat) {
      updateConvMessages(selectedId, (msgs) =>
        msgs.filter((m) => m.id_message !== message.id_message)
      );
      toast.success('Message supprimé.');
      return;
    }

    try {
      await deleteMessage(message.id_message);
      updateConvMessages(selectedId, (msgs) =>
        msgs.filter((m) => m.id_message !== message.id_message)
      );
      toast.success('Message supprimé.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleClearConversation = async () => {
    if (!selectedId) return;
    const partnerName = `${partner?.prenom || ''} ${partner?.nom || ''}`.trim() || 'ce contact';
    if (!window.confirm(`Vider la conversation avec ${partnerName} ?`)) return;

    setClearing(true);
    setError('');

    if (isDemoChat) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id_user === selectedId ? { ...c, messages: [] } : c
        )
      );
      toast.success('Conversation vidée.');
      setClearing(false);
      return;
    }

    try {
      const data = await clearConversation(selectedId);
      toast.success(data.message || 'Conversation vidée.');
      await loadApi();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const handleClearAllMessages = async () => {
    if (conversations.every((c) => !c.messages?.length)) return;
    if (!window.confirm('Vider toute votre messagerie ? Cette action est irréversible.')) return;

    setClearing(true);
    setError('');

    const hasOnlyDemo =
      conversations.length === 1 &&
      conversations[0].id_user === demoConversation.id_user;

    if (hasOnlyDemo) {
      dismissDemoMessaging(user?.role);
      setConversations([]);
      setSelectedId(null);
      toast.success('Messagerie vidée.');
      setClearing(false);
      return;
    }

    try {
      const data = await clearAllMessages();
      if (conversations.some((c) => c.id_user === demoConversation.id_user)) {
        dismissDemoMessaging(user?.role);
      }
      toast.success(data.message || 'Messagerie vidée.');
      setConversations([]);
      setSelectedId(null);
      await loadApi();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteConversationItem = async (e, conv) => {
    e.stopPropagation();
    const partnerName = `${conv.prenom || ''} ${conv.nom || ''}`.trim() || 'ce contact';
    if (!window.confirm(`Supprimer la conversation avec ${partnerName} ?`)) return;

    setClearing(true);
    setError('');

    if (conv.id_user === demoConversation.id_user) {
      dismissDemoMessaging(user?.role);
      setConversations((prev) => prev.filter((c) => c.id_user !== conv.id_user));
      if (selectedId === conv.id_user) {
        setSelectedId(null);
      }
      toast.success('Conversation supprimée.');
      setClearing(false);
      return;
    }

    try {
      const data = await clearConversation(conv.id_user);
      toast.success(data.message || 'Conversation supprimée.');
      if (selectedId === conv.id_user) {
        setSelectedId(null);
      }
      await loadApi();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const messagingSubtitle =
    user?.role === 'recruteur'
      ? 'Échangez avec les candidats.'
      : 'Échangez avec les recruteurs.';

  return (
    <PageShell title="Messages" subtitle={messagingSubtitle}>
      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[480px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
      <div className="grid lg:grid-cols-[300px_1fr] gap-4 min-h-[480px] chat-layout">
        <aside className="bg-white rounded-2xl border border-gray-100 auth-card overflow-hidden flex flex-col">
          <div className="px-4 py-3 text-sm font-semibold text-text-dark border-b border-gray-100 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <MessageSquare className="w-4 h-4 text-primary shrink-0" />
              Conversations
            </span>
            <button
              type="button"
              onClick={handleClearAllMessages}
              disabled={clearing || conversations.every((c) => !c.messages?.length)}
              title="Vider toute la messagerie"
              aria-label="Vider toute la messagerie"
              className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto max-h-[400px]">
            {conversations.map((c) => (
              <li key={c.id_user} className="relative">
                <button
                  type="button"
                  onClick={(e) => handleDeleteConversationItem(e, c)}
                  disabled={clearing || !c.messages?.length}
                  title="Supprimer la conversation"
                  aria-label="Supprimer la conversation"
                  className="absolute top-2 left-2 z-10 p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect(c.id_user)}
                  className={`w-full text-left pl-10 pr-4 py-3 flex items-center gap-3 transition-colors duration-300 ${
                    selectedId === c.id_user ? 'bg-primary-soft' : 'hover:bg-bg-page'
                  }`}
                >
                  <UserAvatar user={partnerUser(c)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-dark truncate">
                      {c.prenom} {c.nom}
                    </p>
                    <p className="text-xs text-text-secondary capitalize">{c.role}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="bg-white rounded-2xl border border-gray-100 auth-card flex flex-col min-h-[480px] max-h-[calc(100vh-220px)]">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <UserAvatar user={partner} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text-dark truncate">
                {partner?.prenom} {partner?.nom}
              </p>
              <p className="text-xs text-text-secondary capitalize">{partner?.role}</p>
            </div>
            <button
              type="button"
              onClick={handleClearConversation}
              disabled={clearing || !selectedConv?.messages?.length}
              title="Vider cette conversation"
              aria-label="Vider cette conversation"
              className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={messagesScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-bg-page/30"
          >
            {(selectedConv?.messages || []).map((m) => {
              const avatarUser = m.is_mine
                ? user
                : { prenom: partner?.prenom, nom: partner?.nom, photo_url: partner?.photo_url };
              return (
                <div
                  key={m.id_message}
                  className={`flex gap-2 ${m.is_mine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <UserAvatar user={avatarUser} size="sm" className="mt-1 shrink-0" />
                  <div className={`max-w-[78%] ${m.is_mine ? 'flex flex-col items-end' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        m.is_mine
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-white text-text-dark border border-gray-100 rounded-bl-md'
                      }`}
                    >
                      {editingId === m.id_message ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                              aria-label="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEdit(m)}
                              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                              aria-label="Enregistrer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="leading-relaxed">{m.contenu}</p>
                          <div
                            className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                              m.is_mine ? 'text-white/75 justify-end' : 'text-text-secondary'
                            }`}
                          >
                            <span>{m.date_label}</span>
                            {m.is_mine &&
                              (m.lu ? (
                                <CheckCheck className="w-3.5 h-3.5" aria-hidden />
                              ) : (
                                <Check className="w-3.5 h-3.5" aria-hidden />
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                    {m.is_mine && editingId !== m.id_message && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          className="p-1.5 rounded-lg text-text-secondary/50 hover:text-primary hover:bg-primary-soft/30 transition-colors"
                          aria-label="Modifier le message"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMessage(m)}
                          className="p-1.5 rounded-lg text-text-secondary/50 hover:text-error hover:bg-red-50 transition-colors"
                          aria-label="Supprimer le message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSend}
            className="p-4 border-t border-gray-100 space-y-3 bg-white rounded-b-2xl shrink-0"
          >
            {contacts.length > 1 && !isDemoChat && (
              <select
                value={newDestinataire}
                onChange={(e) => {
                  const id = e.target.value;
                  setNewDestinataire(id);
                  if (id) setSelectedId(Number(id));
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm md:hidden"
              >
                <option value="">Autre contact…</option>
                {contacts.map((c) => (
                  <option key={c.id_user} value={c.id_user}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-2">
              <textarea
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                placeholder="Écrivez votre message…"
                rows={2}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={sending}
                className="shrink-0 px-4 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                aria-label="Envoyer"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </PageShell>
  );
}
