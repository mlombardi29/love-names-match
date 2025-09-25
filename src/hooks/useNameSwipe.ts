import { useState, useCallback } from 'react';
import { BabyName } from '@/data/names';

export type SwipeDecision = 'love' | 'pass';
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

    // Check if this creates a match
    const otherPartner = currentPartner === 'partner1' ? 'partner2' : 'partner1';
    const otherPartnerDecision = swipeHistory.find(
      record => record.nameId === currentName.id && 
      record.partner === otherPartner &&
      record.decision === 'love'
    );

    if (decision === 'love' && otherPartnerDecision) {
      return {
        name: currentName,
        matchedAt: Date.now()
      } as MatchedName;
    }

    return null;
  }, [getCurrentName, currentPartner, swipeHistory]);

  const getMatches = useCallback((): MatchedName[] => {
    const lovesByPartner1 = swipeHistory.filter(
      record => record.partner === 'partner1' && record.decision === 'love'
    );
    const lovesByPartner2 = swipeHistory.filter(
      record => record.partner === 'partner2' && record.decision === 'love'
    );

    const matches: MatchedName[] = [];
    
    lovesByPartner1.forEach(p1Love => {
      const p2Love = lovesByPartner2.find(p2 => p2.nameId === p1Love.nameId);
      if (p2Love) {
        const name = names.find(n => n.id === p1Love.nameId);
        if (name) {
          matches.push({
            name,
            matchedAt: Math.max(p1Love.timestamp, p2Love.timestamp)
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

  return {
    currentPartner,
    getCurrentName,
    swipeOnName,
    getMatches,
    switchPartner,
    getPartnerProgress,
    swipeHistory,
    isComplete: currentNameIndex[currentPartner] >= names.length
  };
};