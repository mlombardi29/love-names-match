import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, AppMode } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, User, Users, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const friendlyError = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes('rate limit') || m.includes('too many')) return "Whoa, too many attempts! Give it an hour and try again — we promise we'll still be here 😅";
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('wrong password')) return "That email/password combo isn't ringing any bells. Double-check and try again!";
  if (m.includes('already registered') || m.includes('already exists')) return "Looks like that email's taken. Try signing in instead!";
  if (m.includes('email not confirmed')) return "Almost there! Check your inbox and confirm your email first.";
  if (m.includes('network') || m.includes('fetch')) return "Couldn't reach the server — check your connection and try again.";
  if (m.includes('password') && m.includes('short')) return "That password's a little shy. Make it at least 6 characters!";
  if (m.includes('couple space is already full')) return "Oops — that partner space is already full! Each space is just for two 💑";
  if (m.includes('already a member')) return "You're already connected to this partner space!";
  if (m.includes('invalid invite') || m.includes('invalid code')) return "That invite code doesn't exist. Double-check the link and try again!";
  return "Something went sideways on our end. Give it another go!";
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');
  const [isSignUp, setIsSignUp] = useState(() => !!inviteCode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<AppMode>('couple');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, profile, couple, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect already-authenticated users away from /auth
  useEffect(() => {
    if (loading || !user) return;
    if (inviteCode) {
      navigate(`/join/${inviteCode}`, { replace: true });
      return;
    }
    if (profile?.mode === 'couple' && !couple) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [user, profile, couple, loading, inviteCode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      // If joining via invite link, force couple mode
      const finalMode: AppMode = inviteCode ? 'couple' : mode;
      const { error } = await signUp(email, password, displayName, finalMode);
      if (error) {
        toast({ title: 'Sign up failed 😬', description: friendlyError(error.message), variant: 'destructive' });
      } else {
        toast({ title: 'Welcome! 🎉', description: 'Account created. Check your inbox to verify your email.' });
        if (inviteCode) {
          navigate(`/join/${inviteCode}`);
        } else if (finalMode === 'couple') {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Sign in failed 😬', description: friendlyError(error.message), variant: 'destructive' });
      } else if (inviteCode) {
        navigate(`/join/${inviteCode}`);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">BabyNames</h1>
          <p className="text-muted-foreground mt-1">Find the perfect name</p>
          {inviteCode && (
            <p className="text-sm text-primary mt-2 font-medium">
              You've been invited to join a partner space!
            </p>
          )}
        </div>

        <Card className="p-6 bg-card border border-border">
          <div className="flex gap-1 p-1 bg-muted rounded-full mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                !isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          {!isSignUp && inviteCode && (
            <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 space-y-1">
              <p className="font-semibold">Heads up! 👀</p>
              <p>You're about to connect an <span className="font-medium">existing account</span> with the person who invited you. Both of you will share the same name pool going forward.</p>
              <p className="mt-1">One catch: your account must be a solo account — you can't merge two already-coupled spaces. If you're already someone else's partner, this will fail.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Your Name</Label>
                  <Input
                    id="displayName"
                    placeholder="e.g. Sarah"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                {!inviteCode && (
                  <div className="space-y-2">
                    <Label>How will you use BabyNames?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMode('couple')}
                        className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl font-medium transition-all ${
                          mode === 'couple'
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Users className="w-6 h-6" />
                        <span className="text-sm">With a partner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('solo')}
                        className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl font-medium transition-all ${
                          mode === 'solo'
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <User className="w-6 h-6" />
                        <span className="text-sm">Just me</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12"
              />
            </div>

            <Button type="submit" disabled={isLoading} size="lg" className="w-full h-12 text-base font-semibold">
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
