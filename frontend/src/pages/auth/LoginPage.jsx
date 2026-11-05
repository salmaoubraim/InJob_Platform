import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    openLogin();
    navigate('/', { replace: true });
  }, [openLogin, navigate]);

  return null;
}
