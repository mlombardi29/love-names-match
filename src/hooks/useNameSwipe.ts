import { useCallback } from 'react';
import { BabyName } from '@/data/names';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SwipeDecision = 'like' | 'superlike' | 'pass';
export type Partner = 'partner1' | 'partner2';

export interface SwipeRecord {
  nameId: string;
  decision: SwipeDecision;
  userId: string;
  timestamp: number;
}

export interface MatchedName {
  name: BabyName;
  matchedAt: number;
  isSuperMatch?: boolean;
  partner1Decision: SwipeDecision;
  partner2Decision: SwipeDecision;
}

export const useNameSwipe = (
  names: BabyName[],
  swipedNameIds: Set<string>,
  allSwipes: SwipeRecord[],
  partnerUserId: string | null,
) => {
  const { user, couple } = useAuth();

  const getUnswipedNames = useCallback(() => {
    return names.filter(n => !swipedNameIds.has(n.id));
  }, [names, swipedNameIds]);

  const getCurrentName = useCallback(() => {
    const unswiped = getUnswipedNames();
    return unswiped[0] || null;
  }, [getUnswipedNames]);

  const swipeOnName = useCallback(async (decision: SwipeDecision): Promise<MatchedName | null> => {
    const currentName = getCurrentName();
    if (!currentName || !user) return null;

    const payload: {
      user_id: string;
      name_id: string;
      decision: SwipeDecision;
      couple_id?: string;
      solo_owner_id?: string;
    } = {
      user_id: user.id,
      name_id: currentName.id,
      decision,
    };

    if (couple) {
      payload.couple_id = couple.id;
    } else {
      payload.solo_owner_id = user.id;
    }

    // Find existing swipe to update vs insert
    const existing = allSwipes.find(s => s.nameId === currentName.id && s.userId === user.id);
    if (existing) {
      await supabase
        .from('swipes')
        .update({ decision })
        .eq('user_id', user.id)
        .eq('name_id', currentName.id);
    } else {
      await supabase.from('swipes').insert(payload);
    }

    // Match check (only in couple mode)
    if (couple && partnerUserId && (decision === 'like' || decision === 'superlike')) {
      const partnerSwipe = allSwipes.find(
        s => s.nameId === currentName.id &&
        s.userId === partnerUserId &&
        (s.decision === 'like' || s.decision === 'superlike')
      );

      if (partnerSwipe) {
        const isSuperMatch = decision === 'superlike' || partnerSwipe.decision === 'superlike';
        return {
          name: currentName,
          matchedAt: Date.now(),
          isSuperMatch,
          partner1Decision: decision,
          partner2Decision: partnerSwipe.decision,
        };
      }
    }

    return null;
  }, [getCurrentName, user, couple, allSwipes, partnerUserId]);

  const getMatches = useCallback((): MatchedName[] => {
    if (!couple || !user || !partnerUserId) return [];

    const myLikes = allSwipes.filter(
      s => s.userId === user.id && (s.decision === 'like' || s.decision === 'superlike')
    );
    const partnerLikes = allSwipes.filter(
      s => s.userId === partnerUserId && (s.decision === 'like' || s.decision === 'superlike')
    );

    const matches: MatchedName[] = [];

    myLikes.forEach(mine => {
      const theirs = partnerLikes.find(p => p.nameId === mine.nameId);
      if (theirs) {
        const name = names.find(n => n.id === mine.nameId);
        if (name) {
          matches.push({
            name,
            matchedAt: Math.max(mine.timestamp, theirs.timestamp),
            isSuperMatch: mine.decision === 'superlike' || theirs.decision === 'superlike',
            partner1Decision: mine.decision,
            partner2Decision: theirs.decision,
          });
        }
      }
    });

    return matches.sort((a, b) => b.matchedAt - a.matchedAt);
  }, [allSwipes, names, couple, user, partnerUserId]);

  const getPartnerProgress = useCallback((userId: string) => {
    const userSwipes = allSwipes.filter(s => s.userId === userId);
    return {
      current: userSwipes.length,
      total: names.length,
      percentage: names.length > 0 ? (userSwipes.length / names.length) * 100 : 0,
    };
  }, [allSwipes, names.length]);

  const unswiped = getUnswipedNames();

  return {
    currentPartner: 'partner1' as Partner, // legacy compat
    getCurrentName,
    swipeOnName,
    getMatches,
    getPartnerProgress,
    swipeHistory: allSwipes,
    isComplete: unswiped.length === 0 && names.length > 0,
  };
};
