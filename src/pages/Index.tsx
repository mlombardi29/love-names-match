import { useState, useMemo, useEffect, useCallback } from 'react';
import { BabyName, CulturalOrigin, Gender, createNameDatabase } from '@/data/names';
import { useNameSwipe, SwipeRecord, Partner } from '@/hooks/useNameSwipe';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { SwipeView } from '@/components/SwipeView';
import { MatchesList } from '@/components/MatchesList';
import { AddNameForm } from '@/components/AddNameForm';
import { CelebrationModal } from '@/components/CelebrationModal';
import { MatchedName } from '@/hooks/useNameSwipe';

const Index = () => {
  const { user, profile, partnerProfile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'swipe' | 'matches' | 'add'>('swipe');
  const [customNames, setCustomNames] = useState<BabyName[]>([]);
  const [discoveredNames, setDiscoveredNames] = useState<BabyName[]>([]);
  const [celebrationMatch, setCelebrationMatch] = useState<MatchedName | null>(null);
  const [selectedOrigins, setSelectedOrigins] = useState<CulturalOrigin[]>([]);
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all');
  const [allSwipes, setAllSwipes] = useState<SwipeRecord[]>([]);
  const [swipedNameIds, setSwipedNameIds] = useState<Set<string>>(new Set());
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load custom names from DB
  useEffect(() => {
    const loadData = async () => {
      // Load custom names
      const { data: dbNames } = await supabase.from('custom_names').select('*');
      if (dbNames) {
        const mapped: BabyName[] = dbNames.map(n => ({
          id: `custom-db-${n.id}`,
          name: n.name,
          gender: n.gender as Gender,
          origins: (n.origins as CulturalOrigin[]) || [],
          isCustom: true,
        }));
        setCustomNames(mapped);
      }

      // Load all swipes (both partners)
      const { data: dbSwipes } = await supabase.from('swipes').select('*, profiles:user_id(partner_role)');
      
      // Need to get profiles to map user_id -> partner_role
      const { data: profiles } = await supabase.from('profiles').select('user_id, partner_role');
      const roleMap = new Map<string, Partner>();
      profiles?.forEach(p => roleMap.set(p.user_id, p.partner_role as Partner));

      if (dbSwipes) {
        const records: SwipeRecord[] = dbSwipes.map(s => ({
          nameId: s.name_id,
          decision: s.decision as 'like' | 'superlike' | 'pass',
          partner: roleMap.get(s.user_id) || 'partner1',
          timestamp: new Date(s.created_at).getTime(),
        }));
        setAllSwipes(records);

        // Set swiped IDs for current user
        if (user) {
          const mySwipes = dbSwipes.filter(s => s.user_id === user.id);
          setSwipedNameIds(new Set(mySwipes.map(s => s.name_id)));
        }
      }

      setDataLoaded(true);
    };

    if (user) loadData();
  }, [user]);

  const allNames = useMemo(() => {
    let baseNames = [...createNameDatabase(), ...customNames, ...discoveredNames];
    if (selectedGender !== 'all') {
      baseNames = baseNames.filter(name => name.gender === selectedGender);
    }
    if (selectedOrigins.length > 0) {
      baseNames = baseNames.filter(name =>
        name.origins?.some(origin => selectedOrigins.includes(origin))
      );
    }
    return baseNames;
  }, [customNames, discoveredNames, selectedOrigins, selectedGender]);

  const nameSwipe = useNameSwipe(allNames, swipedNameIds, allSwipes);
  const matches = nameSwipe.getMatches();

  const handleSwipe = useCallback(async (decision: 'like' | 'superlike' | 'pass') => {
    const match = await nameSwipe.swipeOnName(decision);
    const currentName = nameSwipe.getCurrentName();
    
    if (currentName) {
      // Update local state immediately
      setSwipedNameIds(prev => new Set([...prev, currentName.id]));
      setAllSwipes(prev => [...prev, {
        nameId: currentName.id,
        decision,
        partner: nameSwipe.currentPartner,
        timestamp: Date.now(),
      }]);
    }

    if (match) {
      setCelebrationMatch(match);
    }
  }, [nameSwipe]);

  const handleAddName = async (name: BabyName) => {
    if (!user) return;
    
    const { data, error } = await supabase.from('custom_names').insert({
      name: name.name,
      gender: name.gender,
      origins: name.origins as any,
      added_by: user.id,
    }).select().single();

    if (data && !error) {
      const newName: BabyName = {
        id: `custom-db-${data.id}`,
        name: data.name,
        gender: data.gender as Gender,
        origins: (data.origins as CulturalOrigin[]) || [],
        isCustom: true,
      };
      setCustomNames(prev => [...prev, newName]);
    }
  };

  const handleAddDiscoveredNames = (names: BabyName[]) => {
    setDiscoveredNames(prev => [...prev, ...names]);
  };

  const closeCelebration = () => setCelebrationMatch(null);

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        matchCount={matches.length}
        displayName={profile?.display_name}
        onSignOut={signOut}
      />

      <main className="pb-12">
        {currentView === 'swipe' && (
          <SwipeView
            names={allNames}
            nameSwipe={nameSwipe}
            onSwipe={handleSwipe}
            selectedOrigins={selectedOrigins}
            onOriginsChange={setSelectedOrigins}
            selectedGender={selectedGender}
            onGenderChange={setSelectedGender}
            onAddNames={handleAddDiscoveredNames}
            matches={matches}
            partnerName={profile?.display_name}
            partnerPartnerName={partnerProfile?.display_name}
          />
        )}

        {currentView === 'matches' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <MatchesList 
              matches={matches}
              partner1Name={profile?.partner_role === 'partner1' ? profile.display_name : partnerProfile?.display_name}
              partner2Name={profile?.partner_role === 'partner2' ? profile.display_name : partnerProfile?.display_name}
            />
          </div>
        )}

        {currentView === 'add' && (
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
            <AddNameForm onAddName={handleAddName} existingNames={allNames} />
          </div>
        )}
      </main>

      <CelebrationModal match={celebrationMatch} onClose={closeCelebration} />
    </div>
  );
};

export default Index;
