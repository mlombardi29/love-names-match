import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { friendlyError } from '@/lib/authErrors';
import { clearCapturedRecoveryError, peekCapturedRecoveryError } from '@/lib/passwordReset';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const {
    user,
    loading,
    passwordRecovery,
    recoveryPending,
    recoveryError,
    updatePassword,
    profile,
    couple,
    dismissRecovery,
    signOut,
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const linkError = recoveryError || peekCapturedRecoveryError();

  const mismatch = confirm.length > 0 && password !== confirm;
  const canSave = password.length >= 6 && confirm.length >= 6 && !mismatch && !isSaving;

  const leaveRecovery = (to: string) => {
    dismissRecovery();
    clearCapturedRecoveryError();
    navigate(to, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError("That password's a little shy. Make it at least 6 characters!");
      return;
    }
    if (password !== confirm) {
      setFormError("Those passwords don't match yet.");
      return;
    }

    setIsSaving(true);
    const { error } = await updatePassword(password);
    setIsSaving(false);

    if (error) {
      const description = friendlyError(error.message);
      setFormError(description);
      toast({ title: "Couldn't update password", description, variant: 'destructive' });
      return;
    }

    setSaved(true);
    toast({ title: "You're back in", description: 'Your new password is saved.' });
    if (profile?.mode === 'couple' && !couple) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Baby Tinder</h1>
          <p className="text-muted-foreground mt-1">Find the perfect name</p>
        </div>

        <Card className="p-6 bg-card border border-border">
          {saved ? (
            <div className="text-center space-y-2" role="status">
              <h2 className="text-xl font-bold text-foreground">You're signed in</h2>
              <p className="text-muted-foreground">Your new password is saved. Taking you into Baby Tinder…</p>
            </div>
          ) : (loading || recoveryPending) && !linkError ? (
            <div className="text-center py-6" role="status">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 animate-pulse flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Checking your reset link…</h2>
              <p className="text-muted-foreground mt-2">Just a moment.</p>
            </div>
          ) : passwordRecovery && user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Pick a new password</h2>
                <p className="text-sm text-muted-foreground">
                  Choose something you'll remember. You'll be signed in to Baby Tinder right after.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  autoFocus
                  className="h-12"
                  aria-invalid={password.length > 0 && password.length < 6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="h-12"
                  aria-invalid={mismatch}
                />
                {mismatch && (
                  <p className="text-sm text-destructive" role="alert">Those passwords don't match yet.</p>
                )}
                {password.length > 0 && password.length < 6 && (
                  <p className="text-sm text-muted-foreground">Make it at least 6 characters.</p>
                )}
              </div>

              {formError && (
                <p className="text-sm text-destructive" role="alert">{formError}</p>
              )}

              <Button type="submit" disabled={!canSave} size="lg" className="w-full h-12 text-base font-semibold">
                {isSaving ? 'Saving…' : 'Save new password'}
              </Button>

              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate('/auth', { replace: true });
                }}
                className="w-full text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              >
                Cancel and return to sign in
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-bold text-foreground">That link didn't work</h2>
              <p className="text-sm text-muted-foreground" role="alert">
                {linkError
                  ? friendlyError(linkError)
                  : 'This reset link is missing, expired, or was already used. Request a new one and try again.'}
              </p>
              <Button
                type="button"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                onClick={() => leaveRecovery('/auth?forgot=1')}
              >
                Send a new link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => leaveRecovery('/auth')}
              >
                Back to sign in
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
