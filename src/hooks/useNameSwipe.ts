import { useState, useCallback } from 'react';
import { BabyName } from '@/data/names';

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

export const useNameSwipe = (names: BabyName[]) => {
  const [currentPartner, setCurrentPartner] = useState<Partner>('partner1');
  const [swipeHistory, setSwipeHistory] = useState<SwipeRecord[]>([]);
  const [currentNameIndex, setCurrentNameIndex] = useState<{ [key in Partner]: number }>({
    partner1: 0,
    partner2: 0
  });

  const getCurrentName = useCallback(() => {
    const index = currentNameIndex[currentPartner];
    return names[index] || null;
  }, [names, currentNameIndex, currentPartner]);

  const swipeOnName = useCallback((decision: SwipeDecision) => {
    const currentName = getCurrentName();
    if (!currentName) return null;

    const swipeRecord: SwipeRecord = {
      nameId: currentName.id,
      decision,
      partner: currentPartner,
      timestamp: Date.now()
    };

    setSwipeHistory(prev => [...prev, swipeRecord]);

    // Move to next name for current partner
    setCurrentNameIndex(prev => ({
      ...prev,
      [currentPartner]: prev[currentPartner] + 1
    }));

    // Check if this creates a match (both partners liked or superliked)
    const otherPartner = currentPartner === 'partner1' ? 'partner2' : 'partner1';
    const otherPartnerRecord = swipeHistory.find(
      record => record.nameId === currentName.id && 
      record.partner === otherPartner &&
      (record.decision === 'like' || record.decision === 'superlike')
    );

    if ((decision === 'like' || decision === 'superlike') && otherPartnerRecord) {
      const isSuperMatch = decision === 'superlike' || otherPartnerRecord.decision === 'superlike';
      const partner1Decision = currentPartner === 'partner1' ? decision : otherPartnerRecord.decision;
      const partner2Decision = currentPartner === 'partner2' ? decision : otherPartnerRecord.decision;
      
      return {
        name: currentName,
        matchedAt: Date.now(),
        isSuperMatch,
        partner1Decision,
        partner2Decision
      } as MatchedName;
    }

    return null;
  }, [getCurrentName, currentPartner, swipeHistory]);

  const getMatches = useCallback((): MatchedName[] => {
    const likesByPartner1 = swipeHistory.filter(
      record => record.partner === 'partner1' && (record.decision === 'like' || record.decision === 'superlike')
    );
    const likesByPartner2 = swipeHistory.filter(
      record => record.partner === 'partner2' && (record.decision === 'like' || record.decision === 'superlike')
    );

    const matches: MatchedName[] = [];
    
    likesByPartner1.forEach(p1Like => {
      const p2Like = likesByPartner2.find(p2 => p2.nameId === p1Like.nameId);
      if (p2Like) {
        const name = names.find(n => n.id === p1Like.nameId);
        if (name) {
          const isSuperMatch = p1Like.decision === 'superlike' || p2Like.decision === 'superlike';
          matches.push({
            name,
            matchedAt: Math.max(p1Like.timestamp, p2Like.timestamp),
            isSuperMatch,
            partner1Decision: p1Like.decision,
            partner2Decision: p2Like.decision
          });
        }
      }
    });

    return matches.sort((a, b) => b.matchedAt - a.matchedAt);
  }, [swipeHistory, names]);

  const switchPartner = useCallback(() => {
    setCurrentPartner(prev => prev === 'partner1' ? 'partner2' : 'partner1');
  }, []);

  const getPartnerProgress = useCallback((partner: Partner) => {
    return {
      current: currentNameIndex[partner],
      total: names.length,
      percentage: names.length > 0 ? (currentNameIndex[partner] / names.length) * 100 : 0
    };
  }, [currentNameIndex, names.length]);

  const addMoreNames = useCallback((newNames: BabyName[]) => {
    // This will be handled at the parent level
    return newNames;
  }, []);

  return {
    currentPartner,
    getCurrentName,
    swipeOnName,
    getMatches,
    switchPartner,
    getPartnerProgress,
    swipeHistory,
    isComplete: currentNameIndex[currentPartner] >= names.length,
    addMoreNames
  };
};
