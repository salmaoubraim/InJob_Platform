import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Eraser,
  Loader2,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminPageToolbar from '../../components/admin/AdminPageToolbar';
import UserAvatar from '../../components/common/UserAvatar';
import { useToast } from '../../context/ToastContext';
import {
  fetchAdminContactMessages,
  replyAdminContactMessage,
  updateAdminContactReply,
  clearAdminContactReply,
  deleteAdminContactMessage,
  markAdminContactRead,
  clearAllAdminContactReplies,
  clearAdminContactReplies,
  notifyAdminInboxChanged,
} from '../../services/adminContactService';
import { getApiErrorMessage } from '../../utils/apiErrors';

const SELECTED_KEY = 'injob_admin_message_id';

function contactUser(contact) {
  const parts = (contact?.nom || 'Contact').trim().split(/\s+/);
  return {
    prenom: parts[0] || 'Contact',
    nom: parts.slice(1).join(' ') || '',
    email: contact?.email,
    role: contact?.role || 'contact',
    photo_profil: contact?.photo_profil,
    photo_url: contact?.photo_url,
  };
}

function groupByContact(messages) {
  const map = new Map();
  for (const m of messages) {
    const email = (m.email || '').toLowerCase();
    if (!email) continue;
    if (!map.has(email)) {
      map.set(email, {
        email,
        nom: m.nom,
        photo_profil: m.photo_profil,
        photo_url: m.photo_url,
        role: m.role,
        items: [],
        latest: m,
        hasUnread: false,
      });
    }
    const g = map.get(email);
    g.items.push(m);
    if (m.id > g.latest.id) {
      g.latest = m;
      g.photo_profil = m.photo_profil ?? g.photo_profil;
      g.photo_url = m.photo_url ?? g.photo_url;
      g.role = m.role ?? g.role;
    }
    if (m.is_unread || m.statut === 'nouveau') g.hasUnread = true;
  }
  return Array.from(map.values())
    .map((g) => ({
      ...g,
      items: [...g.items].sort((a, b) => a.id - b.id),
    }))
    .sort((a, b) => b.latest.id - a.latest.id);
}

function formatNow() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function syncListItem(messages, data) {
  return messages.map((m) => (m.id === data.id ? { ...m, ...data } : m));
}

export default function AdminMessagesPage() {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef(null);
  const restoredRef = useRef(false);
  const [messages, setMessages] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [reply, setReply] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const contacts = useMemo(() => groupByContact(messages), [messages]);
  const selectedContact = contacts.find((c) => c.email === selectedEmail) || null;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  };

  const persistSelection = (id) => {
    if (id) {
      setSearchParams({ id: String(id) }, { replace: true });
      sessionStorage.setItem(SELECTED_KEY, String(id));
    } else {
      setSearchParams({}, { replace: true });
      sessionStorage.removeItem(SELECTED_KEY);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminContactMessages({ q });
      const list = res.data || [];
      setMessages(list);
      setUnreadCount(res.meta?.unread_count ?? 0);
      notifyAdminInboxChanged();
      return list;
    } catch {
      setMessages([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const selectContact = useCallback(async (email) => {
    const contact = groupByContact(messages).find((c) => c.email === email);
    if (!contact) return;

    setSelectedEmail(email);
    setReply('');
    setEditingId(null);
    setEditText('');
    persistSelection(contact.latest.id);

    if (contact.hasUnread) {
      try {
        await markAdminContactRead(email);
        setMessages((prev) =>
          prev.map((m) =>
            m.email.toLowerCase() === email && m.statut === 'nouveau'
              ? { ...m, statut: 'lu', is_unread: false, est_lu: true, date_lecture: formatNow() }
              : m
          )
        );
        setUnreadCount((c) => Math.max(0, c - contact.items.filter((i) => i.is_unread).length));
        notifyAdminInboxChanged();
      } catch {
        /* ignore */
      }
    }
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (restoredRef.current || loading || contacts.length === 0) return;
    const rawId = searchParams.get('id') || sessionStorage.getItem(SELECTED_KEY);
    if (!rawId) return;
    const msg = messages.find((m) => m.id === Number(rawId));
    if (!msg) return;
    restoredRef.current = true;
    setSelectedEmail(msg.email.toLowerCase());
  }, [loading, contacts.length, messages, searchParams]);

  const applyItemUpdate = (data) => {
    setMessages((prev) => syncListItem(prev, data));
  };

  const sendReply = async (e) => {
    e?.preventDefault();
    const text = reply.trim();
    if (!text || !selectedContact) return;

    const targetId = selectedContact.latest.id;
    const previous = messages;
    const optimistic = {
      ...selectedContact.latest,
      reponse_admin: text,
      date_reponse: formatNow(),
      statut: 'repondu',
      est_lu: true,
      is_unread: false,
    };

    setReply('');
    setMessages((prev) => syncListItem(prev, optimistic));
    scrollToBottom();

    setSending(true);
    try {
      const res = await replyAdminContactMessage(targetId, text);
      applyItemUpdate(res.data);
      toast.success('Réponse envoyée.');
      scrollToBottom();
    } catch (err) {
      setMessages(previous);
      setReply(text);
      toast.error(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const saveEditReply = async (item) => {
    const text = editText.trim();
    if (!text) return;
    try {
      const res = await updateAdminContactReply(item.id, text);
      applyItemUpdate(res.data);
      setEditingId(null);
      setEditText('');
      toast.success('Réponse modifiée.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const removeReply = async (item) => {
    if (!window.confirm('Supprimer cette réponse ?')) return;
    try {
      const res = await clearAdminContactReply(item.id);
      applyItemUpdate(res.data);
      setEditingId(null);
      toast.success('Réponse supprimée.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const clearRepliesInState = (email = null) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (email && m.email.toLowerCase() !== email) return m;
        return {
          ...m,
          message: m.message,
          reponse_admin: null,
          date_reponse: null,
          statut: m.statut === 'repondu' ? 'lu' : m.statut,
          est_lu: m.statut !== 'nouveau',
          is_unread: m.statut === 'nouveau',
        };
      })
    );
    setEditingId(null);
    setReply('');
  };

  const handleClearSelected = async () => {
    if (!selectedContact) return;
    if (
      !window.confirm(
        'Vider uniquement vos réponses envoyées ?\nLes messages reçus de ce contact seront conservés.'
      )
    ) {
      return;
    }
    const email = selectedContact.email.toLowerCase();
    setClearing(true);
    try {
      await clearAdminContactReplies(selectedContact.email);
      clearRepliesInState(email);
      toast.success('Réponses supprimées. Messages reçus conservés.');
      scrollToBottom();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const handleClearAll = async () => {
    if (!contacts.length) return;
    if (
      !window.confirm(
        'Vider uniquement toutes vos réponses envoyées ?\nLes contacts et leurs messages reçus restent dans la liste.'
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      await clearAllAdminContactReplies();
      clearRepliesInState();
      toast.success('Réponses supprimées. Messages reçus conservés.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteContact = async (e, contact) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer tous les messages de ${contact.nom} ?`)) return;
    try {
      await Promise.all(contact.items.map((m) => deleteAdminContactMessage(m.id)));
      if (selectedEmail === contact.email) {
        setSelectedEmail('');
        persistSelection(null);
      }
      toast.success('Contact supprimé.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <AdminPageShell title={t('messages.title')} subtitle={t('messages.subtitle')}>
      <AdminPageToolbar
        value={q}
        onChange={setQ}
        placeholder={t('messages.searchPlaceholder')}
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[300px_1fr] gap-4 min-h-[480px] chat-layout">
          <aside className="bg-white rounded-2xl border border-gray-100 auth-card overflow-hidden flex flex-col">
            <div className="px-4 py-3 text-sm font-semibold text-text-dark border-b border-gray-100 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                Conversations
                {unreadCount > 0 && (
                  <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-error text-white text-xs font-bold flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearing || contacts.length === 0}
                title="Vider vos réponses (conserver les messages reçus)"
                aria-label="Vider vos réponses"
                className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0"
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto max-h-[500px]">
              {contacts.map((c) => (
                <li key={c.email} className="relative">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteContact(e, c)}
                    title="Supprimer la conversation"
                    aria-label="Supprimer la conversation"
                    className="absolute top-2 left-2 z-10 p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectContact(c.email)}
                    className={`w-full text-left pl-10 pr-4 py-3 flex items-center gap-3 transition-colors ${
                      selectedEmail === c.email ? 'bg-primary-soft' : 'hover:bg-bg-page'
                    }`}
                  >
                    <UserAvatar user={contactUser(c)} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${c.hasUnread ? 'font-bold text-text-dark' : 'font-medium text-text-dark'}`}>
                        {c.nom}
                      </p>
                      <p className="text-xs text-text-secondary truncate">{c.email}</p>
                    </div>
                    {c.hasUnread && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                </li>
              ))}
              {contacts.length === 0 && (
                <p className="p-6 text-center text-sm text-text-secondary">{t('common.noData')}</p>
              )}
            </ul>
          </aside>

          <div className="bg-white rounded-2xl border border-gray-100 auth-card flex flex-col min-h-[480px] max-h-[calc(100vh-220px)]">
            {selectedContact ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
                  <UserAvatar user={contactUser(selectedContact)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-dark truncate">{selectedContact.nom}</p>
                    <p className="text-xs text-text-secondary truncate">{selectedContact.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    disabled={clearing}
                    title="Vider vos réponses (conserver les messages reçus)"
                    aria-label="Vider vos réponses"
                    className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>

                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-bg-page/30"
                >
                  {selectedContact.items.map((item) => (
                    <div key={item.id} className="space-y-3">
                      <div className="flex gap-2 flex-row">
                        <UserAvatar user={contactUser(selectedContact)} size="sm" className="mt-1 shrink-0" />
                        <div className="max-w-[78%]">
                          <div className="rounded-2xl px-4 py-2.5 text-sm bg-white text-text-dark border border-gray-100 shadow-sm rounded-bl-md">
                            <p className="leading-relaxed whitespace-pre-wrap">{item.message}</p>
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-text-secondary">
                              <span>{item.created_at}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {item.reponse_admin && (
                        <div className="flex gap-2 flex-row-reverse">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 text-white text-xs font-bold">
                            A
                          </div>
                          <div className="max-w-[78%] flex flex-col items-end">
                            <div className="rounded-2xl px-4 py-2.5 text-sm bg-primary text-white shadow-sm rounded-br-md">
                              {editingId === item.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => { setEditingId(null); setEditText(''); }} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                                      <X className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={() => saveEditReply(item)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="leading-relaxed whitespace-pre-wrap">{item.reponse_admin}</p>
                                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-white/75 justify-end">
                                    <span>{item.date_reponse}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            {editingId !== item.id && (
                              <div className="flex items-center gap-1 mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => { setEditingId(item.id); setEditText(item.reponse_admin); }}
                                  className="p-1.5 rounded-lg text-text-secondary/50 hover:text-primary hover:bg-primary-soft/30 transition-colors"
                                  aria-label="Modifier"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeReply(item)}
                                  className="p-1.5 rounded-lg text-text-secondary/50 hover:text-error hover:bg-red-50 transition-colors"
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={sendReply} className="p-4 border-t border-gray-100 flex gap-2 shrink-0 bg-white rounded-b-2xl">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    placeholder={t('messages.replyPlaceholder')}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="shrink-0 px-4 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors h-11 flex items-center justify-center"
                    aria-label="Envoyer"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8">
                <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-center">{t('messages.selectMessage')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
