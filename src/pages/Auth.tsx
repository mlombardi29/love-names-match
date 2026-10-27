import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, AppMode } from '@/hooks/useAuth';
import { friendlyError } from '@/lib/authErrors';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, User, Users, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');
  const [isSignUp, setIsSignUp] = useState(() => !!inviteCode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<AppMode>('couple');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(() => searchParams.get('forgot') === '1');
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const { signIn, signUp, requestPasswordReset, user, profile, couple, loading, passwordRecovery, recoveryPending, recoveryError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect already-authenticated users away from /auth
  useEffect(() => {
    if (loading || !user || passwordRecovery || recoveryPending || recoveryError) return;
    if (inviteCode) {
      navigate(`/join/${inviteCode}`, { replace: true });
      return;
    }
    if (profile?.mode === 'couple' && !couple) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [user, profile, couple, loading, inviteCode, navigate, passwordRecovery, recoveryPending, recoveryError]);

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

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setIsLoading(true);
    const { error } = await requestPasswordReset(email);
    setIsLoading(false);
    if (error) {
      const description = friendlyError(error.message);
      setForgotError(description);
      toast({ title: "Couldn't send the reset email", description, variant: 'destructive' });
      return;
    }
    setResetSentTo(email.trim());
    toast({
      title: 'Check your inbox',
      description: 'If that email has a Baby Tinder account, a reset link is on the way.',
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Baby Tinder</h1>
          <p className="text-muted-foreground mt-1">Find the perfect name</p>
          {inviteCode && (
            <p className="text-sm text-primary mt-2 font-medium">
              You've been invited to join a partner space!
            </p>
          )}
        </div>

        <Card className="p-6 bg-card border border-border">
          {!showForgot && <div className="flex gap-1 p-1 bg-muted rounded-full mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setShowForgot(false); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                !isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setShowForgot(false); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>}

          {showForgot ? (
            resetSentTo ? (
              <div className="space-y-4" role="status">
                <h2 className="text-xl font-bold text-foreground">Check your inbox</h2>
                <p className="text-sm text-muted-foreground">
                  If <span className="font-medium text-foreground">{resetSentTo}</span> has a Baby Tinder account, we just sent a link to pick a new password. It can take a minute, and it sometimes lands in spam.
                </p>
                <p className="text-sm text-muted-foreground">
                  Open the link to choose a new password and sign back in to Baby Tinder.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setShowForgot(false); setResetSentTo(null); setForgotError(null); }}
                >
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground">Forgot your password?</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the email you use for Baby Tinder and we'll send you a link to pick a new one.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="h-12"
                  />
                </div>
                {forgotError && (
                  <p className="text-sm text-destructive" role="alert">{forgotError}</p>
                )}
                <Button type="submit" disabled={isLoading} size="lg" className="w-full h-12 text-base font-semibold">
                  {isLoading ? 'Sending…' : 'Send reset link'}
                </Button>
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setForgotError(null); }}
                  className="w-full text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                >
                  Back to sign in
                </button>
              </form>
            )
          ) : (
          <>
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
                    <Label>How will you use Baby Tinder?</Label>
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
              {!isSignUp && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotError(null); setResetSentTo(null); }}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline py-1"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" disabled={isLoading} size="lg" className="w-full h-12 text-base font-semibold">
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
