import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/Button';

interface Props {
  applicationId: string;
}

export default function OppositionButton({ applicationId }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOpposition = () => {
    if (!user) {
      // Store the intended opposition target
      sessionStorage.setItem('oppositionRedirect', `/applications/${applicationId}/oppose`);
      navigate('/login');
      return;
    }

    navigate(`/applications/${applicationId}/oppose`);
  };

  return (
    <Button
      variant="secondary"
      onClick={handleOpposition}
    >
      File Opposition
    </Button>
  );
}