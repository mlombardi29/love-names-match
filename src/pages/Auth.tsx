import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Heart, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [partnerRole, setPartnerRole] = useState<'partner1' | 'partner2'>('partner1');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName, partnerRole);
      if (error) {
        toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome!', description: 'Account created successfully.' });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">BabyNames</h1>
          <p className="text-muted-foreground mt-1">Find the perfect name together</p>
        </div>

        <Card className="p-6 bg-card border border-border">
          {/* Toggle */}
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

                <div className="space-y-2">
                  <Label>You are...</Label>
                  <div className="flex gap-3">
                    {(['partner1', 'partner2'] as const).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setPartnerRole(role)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                          partnerRole === role
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        {role === 'partner1' ? 'Partner 1' : 'Partner 2'}
                      </button>
                    ))}
                  </div>
                </div>
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
