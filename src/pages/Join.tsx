import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Join = () => {
  const { code } = useParams<{ code: string }>();
  const { user, couple, joinCoupleByCode, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'joining' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (loading) return;

    // Not signed in — send to auth with invite param
    if (!user) {
      navigate(`/auth?invite=${code}`);
      return;
    }

    // Already in a couple
    if (couple) {
      if (couple.invite_code === code) {
        navigate('/');
      } else {
        setStatus('error');
        setErrorMessage("You're already coupled up with someone else! Each account can only be in one partner space at a time. Sign out first if you want to start fresh.");
      }
      return;
    }

    // Auto-attempt join
    if (status === 'idle' && code) {
      setStatus('joining');
      joinCoupleByCode(code).then(({ error }) => {
        if (error) {
          setStatus('error');
          const m = error.message.toLowerCase();
          const friendly = m.includes('already full')
            ? "Oops — that partner space is already full! Each space is just for two 💑"
            : m.includes('already a member')
            ? "You're already in this partner space — no need to join again!"
            : m.includes('invalid') || m.includes('not found')
            ? "That invite code doesn't exist. Double-check the link and try again!"
            : "Something went sideways joining that space. Give it another go!";
          setErrorMessage(friendly);
        } else {
          setStatus('done');
          toast({ title: 'Connected!', description: 'You and your partner are now linked.' });
          setTimeout(() => navigate('/'), 1200);
        }
      });
    }
  }, [user, couple, loading, code, status, joinCoupleByCode, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
          {status === 'done' ? <Heart className="w-8 h-8 text-primary-foreground fill-current" /> : <Sparkles className="w-8 h-8 text-primary-foreground" />}
        </div>
        {status === 'joining' && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Joining...</h1>
            <p className="text-muted-foreground mt-2">Connecting you with your partner</p>
          </>
        )}
        {status === 'done' && (
          <>
            <h1 className="text-2xl font-bold text-foreground">You're connected!</h1>
            <p className="text-muted-foreground mt-2">Redirecting to your shared space...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Couldn't join</h1>
            <p className="text-muted-foreground mt-2">{errorMessage}</p>
            <Button onClick={() => navigate('/')} className="mt-6">Go to App</Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Join;
