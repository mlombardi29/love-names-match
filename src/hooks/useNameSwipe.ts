import { useCallback } from 'react';
import { BabyName } from '@/data/names';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SwipeDecision = 'like' | 'superlike' | 'pass';
export type Partner = 'partner1' | 'partner2';

export interface SwipeRecord {
  nameId: string;
  decision: SwipeDecision;
  partner: Partner;
  timestamp: number;
}

export interface MatchedName {
  name: BabyName;
  matchedAt: number;
  isSuperMatch?: boolean;
  partner1Decision: SwipeDecision;
  partner2Decision: SwipeDecision;
}

export const useNameSwipe = (names: BabyName[], swipedNameIds: Set<string>, allSwipes: SwipeRecord[]) => {
  const { profile } = useAuth();
  const currentPartner: Partner = profile?.partner_role as Partner || 'partner1';

  const getUnswipedNames = useCallback(() => {
    return names.filter(n => !swipedNameIds.has(n.id));
  }, [names, swipedNameIds]);

  const getCurrentName = useCallback(() => {
    const unswiped = getUnswipedNames();
    return unswiped[0] || null;
  }, [getUnswipedNames]);

  const swipeOnName = useCallback(async (decision: SwipeDecision): Promise<MatchedName | null> => {
    const currentName = getCurrentName();
    if (!currentName || !profile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Save swipe to database
    await supabase.from('swipes').upsert({
      user_id: user.id,
      name_id: currentName.id,
      decision,
    }, { onConflict: 'user_id,name_id' });

    // Check for match
    if (decision === 'like' || decision === 'superlike') {
      const otherPartnerSwipe = allSwipes.find(
        s => s.nameId === currentName.id &&
        s.partner !== currentPartner &&
        (s.decision === 'like' || s.decision === 'superlike')
      );

      if (otherPartnerSwipe) {
        const isSuperMatch = decision === 'superlike' || otherPartnerSwipe.decision === 'superlike';
        const p1Decision = currentPartner === 'partner1' ? decision : otherPartnerSwipe.decision;
        const p2Decision = currentPartner === 'partner2' ? decision : otherPartnerSwipe.decision;

        return {
          name: currentName,
          matchedAt: Date.now(),
          isSuperMatch,
          partner1Decision: p1Decision,
          partner2Decision: p2Decision,
        };
      }
    }

    return null;
  }, [getCurrentName, currentPartner, allSwipes, profile]);

  const getMatches = useCallback((): MatchedName[] => {
    const p1Likes = allSwipes.filter(
      s => s.partner === 'partner1' && (s.decision === 'like' || s.decision === 'superlike')
    );
    const p2Likes = allSwipes.filter(
      s => s.partner === 'partner2' && (s.decision === 'like' || s.decision === 'superlike')
    );

    const matches: MatchedName[] = [];

    p1Likes.forEach(p1 => {
      const p2 = p2Likes.find(p => p.nameId === p1.nameId);
      if (p2) {
        const name = names.find(n => n.id === p1.nameId);
        if (name) {
          matches.push({
            name,
            matchedAt: Math.max(p1.timestamp, p2.timestamp),
            isSuperMatch: p1.decision === 'superlike' || p2.decision === 'superlike',
            partner1Decision: p1.decision,
            partner2Decision: p2.decision,
          });
        }
      }
    });

    return matches.sort((a, b) => b.matchedAt - a.matchedAt);
  }, [allSwipes, names]);

  const getPartnerProgress = useCallback((partner: Partner) => {
    const partnerSwipes = allSwipes.filter(s => s.partner === partner);
    return {
      current: partnerSwipes.length,
      total: names.length,
      percentage: names.length > 0 ? (partnerSwipes.length / names.length) * 100 : 0,
    };
  }, [allSwipes, names.length]);

  const unswiped = getUnswipedNames();

  return {
    currentPartner,
    getCurrentName,
    swipeOnName,
    getMatches,
    getPartnerProgress,
    swipeHistory: allSwipes,
    isComplete: unswiped.length === 0 && names.length > 0,
  };
};
