import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppMode = 'solo' | 'couple';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  mode: AppMode;
}

export interface Couple {
  id: string;
  invite_code: string;
  created_by: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  couple: Couple | null;
  partnerProfile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string, mode: AppMode) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createCouple: () => Promise<{ couple: Couple | null; error: Error | null }>;
  joinCoupleByCode: (code: string) => Promise<{ error: Error | null }>;
  refreshCouple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string) => {
    // Load my profile
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (myProfile) setProfile(myProfile as Profile);

    // Load my couple membership
    const { data: membership } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (membership?.couple_id) {
      const { data: coupleData } = await supabase
        .from('couples')
        .select('*')
        .eq('id', membership.couple_id)
        .maybeSingle();
      if (coupleData) setCouple(coupleData as Couple);

      // Load partner profile (other member)
      const { data: members } = await supabase
        .from('couple_members')
        .select('user_id')
        .eq('couple_id', membership.couple_id);

      const partnerUserId = members?.find(m => m.user_id !== userId)?.user_id;
      if (partnerUserId) {
        const { data: partner } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', partnerUserId)
          .maybeSingle();
        if (partner) setPartnerProfile(partner as Profile);
        else setPartnerProfile(null);
      } else {
        setPartnerProfile(null);
      }
    } else {
      setCouple(null);
      setPartnerProfile(null);
    }
  }, []);

  const refreshCouple = useCallback(async () => {
    if (user) await loadUserData(user.id);
  }, [user, loadUserData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => loadUserData(session.user.id), 0);
        } else {
          setProfile(null);
          setCouple(null);
          setPartnerProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, displayName: string, mode: AppMode) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) return { error: error as Error };

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          display_name: displayName,
          mode,
        });
      if (profileError) return { error: profileError as unknown as Error };

      // Reload user data now that the profile exists (avoids race with onAuthStateChange)
      await loadUserData(data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCouple(null);
    setPartnerProfile(null);
  };

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const createCouple = async (): Promise<{ couple: Couple | null; error: Error | null }> => {
    if (!user) return { couple: null, error: new Error('Not authenticated') };

    const { data: newCouple, error } = await supabase
      .rpc('create_couple_with_code')
      .single();

    if (error || !newCouple) {
      return { couple: null, error: (error as unknown as Error) ?? new Error('Failed to create couple') };
    }

    // If user has solo data, upgrade it
    await supabase.rpc('upgrade_solo_data_to_couple', { _couple_id: (newCouple as Couple).id });

    await loadUserData(user.id);
    return { couple: newCouple as Couple, error: null };
  };

  const joinCoupleByCode = async (code: string): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Not authenticated') };

    const normalized = code.trim().toUpperCase();
    const { data: targetCouple, error: lookupError } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_code', normalized)
      .maybeSingle();

    if (lookupError) return { error: lookupError as unknown as Error };
    if (!targetCouple) return { error: new Error('Invalid invite code') };

    // Check current membership count
    const { data: members } = await supabase
      .from('couple_members')
      .select('user_id')
      .eq('couple_id', targetCouple.id);

    if (members && members.length >= 2) {
      return { error: new Error('This couple space is already full') };
    }
    if (members?.some(m => m.user_id === user.id)) {
      return { error: new Error("You're already a member of this couple") };
    }

    const { error: joinError } = await supabase
      .from('couple_members')
      .insert({ couple_id: targetCouple.id, user_id: user.id });

    if (joinError) return { error: joinError as unknown as Error };

    // Upgrade any solo data
    await supabase.rpc('upgrade_solo_data_to_couple', { _couple_id: targetCouple.id });

    await loadUserData(user.id);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user, profile, couple, partnerProfile, session, loading,
      signIn, signUp, signOut, createCouple, joinCoupleByCode, refreshCouple,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
