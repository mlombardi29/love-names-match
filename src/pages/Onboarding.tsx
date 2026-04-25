import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Send, KeyRound, Copy, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Couple } from '@/hooks/useAuth';

const Onboarding = () => {
  const { user, profile, couple, createCouple, joinCoupleByCode, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'choose' | 'invite' | 'join'>('choose');
  const [code, setCode] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteCouple, setInviteCouple] = useState<Couple | null>(null);
  // Ref so the redirect effect reads the up-to-date value synchronously,
  // even when couple state and mode state updates land in different React batches.
  const inviteInProgress = useRef(false);

  // If already in a couple, go to app — but not if we're mid-invite-flow
  useEffect(() => {
    if (!loading && couple && !inviteInProgress.current) {
      navigate('/');
    }
  }, [couple, loading, navigate]);

  // If user is solo (no couple intent), go to app
  useEffect(() => {
    if (!loading && profile?.mode === 'solo' && !couple) {
      navigate('/');
    }
  }, [profile, couple, loading, navigate]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleInvite = async () => {
    inviteInProgress.current = true; // set before any await so the redirect effect sees it immediately
    setIsWorking(true);
    const { couple: newCouple, error } = await createCouple();
    setIsWorking(false);
    if (error || !newCouple) {
      inviteInProgress.current = false;
      toast({ title: 'Failed to create invite', description: error?.message, variant: 'destructive' });
    } else {
      setInviteCouple(newCouple);
      setMode('invite');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWorking(true);
    const { error } = await joinCoupleByCode(code);
    setIsWorking(false);
    if (error) {
      toast({ title: 'Could not join', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Joined!', description: "You're now in a shared partner space." });
      navigate('/');
    }
  };

  const activeInviteCouple = inviteCouple ?? couple;
  const inviteLink = activeInviteCouple ? `${window.location.origin}/join/${activeInviteCouple.invite_code}` : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Invite link copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {profile.display_name}!</h1>
          <p className="text-muted-foreground mt-1">Set up your partner space</p>
        </div>

        <Card className="p-6 bg-card border border-border">
          {mode === 'choose' && (
            <div className="space-y-3">
              <button
                onClick={handleInvite}
                disabled={isWorking}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-border transition-all text-left disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Invite my partner</h3>
                  <p className="text-sm text-muted-foreground">Get a link to share with them</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-border transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Join my partner</h3>
                  <p className="text-sm text-muted-foreground">Enter the invite code they sent you</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground pt-2"
              >
                Skip for now — browse names solo
              </button>
            </div>
          )}

          {mode === 'invite' && activeInviteCouple && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Share with your partner</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  When they sign up using this link, you'll be connected automatically.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Invite Code</Label>
                <div className="text-3xl font-bold text-center tracking-[0.3em] py-4 bg-muted rounded-xl text-foreground">
                  {activeInviteCouple.invite_code}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Invite Link</Label>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly className="h-12 text-sm" />
                  <Button onClick={copyLink} size="lg" variant="outline" className="h-12 shrink-0">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={() => navigate('/')} size="lg" className="w-full h-12">
                Continue to App
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You can start swiping now — your partner can join anytime.
              </p>
            </div>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Enter invite code</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask your partner for the 6-character code from their invite.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Invite Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  required
                  className="h-14 text-2xl text-center tracking-[0.3em] font-bold uppercase"
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setMode('choose')} className="h-12">
                  Back
                </Button>
                <Button type="submit" disabled={isWorking || code.length !== 6} size="lg" className="flex-1 h-12">
                  {isWorking ? 'Joining...' : 'Join'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
