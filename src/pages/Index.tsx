import { useState, useMemo, useEffect, useCallback } from 'react';
import { BabyName, CulturalOrigin, Gender, createNameDatabase } from '@/data/names';
import { useNameSwipe, SwipeRecord } from '@/hooks/useNameSwipe';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { SwipeView } from '@/components/SwipeView';
import { MatchesList } from '@/components/MatchesList';
import { AddNameForm } from '@/components/AddNameForm';
import { CelebrationModal } from '@/components/CelebrationModal';
import { MatchedName } from '@/hooks/useNameSwipe';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, profile, partnerProfile, couple, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'swipe' | 'matches' | 'add'>('swipe');
  const [customNames, setCustomNames] = useState<BabyName[]>([]);
  const [discoveredNames, setDiscoveredNames] = useState<BabyName[]>([]);
  const [celebrationMatch, setCelebrationMatch] = useState<MatchedName | null>(null);
  const [selectedOrigins, setSelectedOrigins] = useState<CulturalOrigin[]>([]);
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all');
  const [allSwipes, setAllSwipes] = useState<SwipeRecord[]>([]);
  const [swipedNameIds, setSwipedNameIds] = useState<Set<string>>(new Set());
  const [dataLoaded, setDataLoaded] = useState(false);
  const [partnerAddedNameIds, setPartnerAddedNameIds] = useState<Set<string>>(new Set());

  const partnerUserId = partnerProfile?.user_id ?? null;

  // Load custom names + swipes scoped to current space
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setDataLoaded(false);

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
        setPartnerAddedNameIds(new Set(
          dbNames.filter(n => n.added_by !== user.id).map(n => `custom-db-${n.id}`)
        ));
      }

      const { data: dbSwipes } = await supabase.from('swipes').select('*');
      if (dbSwipes) {
        const records: SwipeRecord[] = dbSwipes.map(s => ({
          nameId: s.name_id,
          decision: s.decision as 'like' | 'superlike' | 'pass',
          userId: s.user_id,
          timestamp: new Date(s.created_at).getTime(),
        }));
        setAllSwipes(records);

        const mySwipes = dbSwipes.filter(s => s.user_id === user.id);
        setSwipedNameIds(new Set(mySwipes.map(s => s.name_id)));
      }

      setDataLoaded(true);
    };

    if (user) loadData();
    // Reload when couple changes (e.g. after upgrade or join)
  }, [user, couple?.id]);

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

  const nameSwipe = useNameSwipe(allNames, swipedNameIds, allSwipes, partnerUserId);
  const matches = nameSwipe.getMatches();

  const handleSwipe = useCallback(async (decision: 'like' | 'superlike' | 'pass') => {
    if (!user) return;
    const currentName = nameSwipe.getCurrentName();
    const match = await nameSwipe.swipeOnName(decision);

    if (currentName) {
      setSwipedNameIds(prev => new Set([...prev, currentName.id]));
      setAllSwipes(prev => [...prev, {
        nameId: currentName.id,
        decision,
        userId: user.id,
        timestamp: Date.now(),
      }]);
    }

    if (match) {
      setCelebrationMatch(match);
    }
  }, [nameSwipe, user]);

  const handleAddName = async (name: BabyName) => {
    if (!user) return;

    const payload: {
      name: string;
      gender: Gender;
      origins: CulturalOrigin[];
      added_by: string;
      couple_id?: string;
      solo_owner_id?: string;
    } = {
      name: name.name,
      gender: name.gender,
      origins: name.origins ?? [],
      added_by: user.id,
    };

    if (couple) {
      payload.couple_id = couple.id;
    } else {
      payload.solo_owner_id = user.id;
    }

    const { data, error } = await supabase.from('custom_names').insert(payload).select().single();

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

  const isInCouple = !!couple;
  // If in couple but matches view requested without partner yet, still show matches list (will be empty)

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        matchCount={matches.length}
        displayName={profile?.display_name}
        partnerName={partnerProfile?.display_name}
        isInCouple={isInCouple}
        onSignOut={signOut}
        onInvitePartner={() => navigate('/onboarding')}
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
            {!isInCouple ? (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold mb-2 text-foreground">Solo mode — no matches</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Matches happen when you and a partner both like the same name. Invite a partner to get started.
                </p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
                >
                  Invite a partner
                </button>
              </div>
            ) : (
              <>
                {partnerProfile ? (
                  <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                      💑
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {profile?.display_name} & {partnerProfile.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your partner has swiped on {nameSwipe.getPartnerProgress(partnerUserId!).current} names
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-2xl bg-muted border border-border flex items-center gap-3">
                    <span className="text-xl">⏳</span>
                    <p className="text-sm text-muted-foreground">Waiting for your partner to join… Share the invite link to get them in!</p>
                  </div>
                )}
                <MatchesList
                  matches={matches}
                  partner1Name={profile?.display_name}
                  partner2Name={partnerProfile?.display_name}
                  partnerAddedNameIds={partnerAddedNameIds}
                />
              </>
            )}
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
