import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { openRegister } = useAuthModal();

  useEffect(() => {
    const role = new URLSearchParams(search).get('role');
    openRegister(role);
    navigate('/', { replace: true });
  }, [openRegister, navigate, search]);

  return null;
}
