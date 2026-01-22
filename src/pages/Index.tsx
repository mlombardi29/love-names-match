import { useState, useMemo } from 'react';
import { BabyName, CulturalOrigin, Gender, createNameDatabase } from '@/data/names';
import { useNameSwipe } from '@/hooks/useNameSwipe';
import { Navigation } from '@/components/Navigation';
import { SwipeView } from '@/components/SwipeView';
import { MatchesList } from '@/components/MatchesList';
import { AddNameForm } from '@/components/AddNameForm';
import { CelebrationModal } from '@/components/CelebrationModal';
import { MatchedName } from '@/hooks/useNameSwipe';

const Index = () => {
  const [currentView, setCurrentView] = useState<'swipe' | 'matches' | 'add'>('swipe');
  const [customNames, setCustomNames] = useState<BabyName[]>([]);
  const [discoveredNames, setDiscoveredNames] = useState<BabyName[]>([]);
  const [celebrationMatch, setCelebrationMatch] = useState<MatchedName | null>(null);
  const [selectedOrigins, setSelectedOrigins] = useState<CulturalOrigin[]>([]);
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all');

  const allNames = useMemo(() => {
    let baseNames = [...createNameDatabase(), ...customNames, ...discoveredNames];
    
    // Filter by gender
    if (selectedGender !== 'all') {
      baseNames = baseNames.filter(name => name.gender === selectedGender);
    }
    
    // Filter by cultural origins
    if (selectedOrigins.length > 0) {
      baseNames = baseNames.filter(name => 
        name.origins?.some(origin => selectedOrigins.includes(origin))
      );
    }
    
    return baseNames;
  }, [customNames, discoveredNames, selectedOrigins, selectedGender]);

  const nameSwipe = useNameSwipe(allNames);
  const matches = nameSwipe.getMatches();

  const handleMatch = (match: MatchedName) => {
    setCelebrationMatch(match);
  };

  const handleAddName = (name: BabyName) => {
    setCustomNames(prev => [...prev, name]);
  };

  const handleAddDiscoveredNames = (names: BabyName[]) => {
    setDiscoveredNames(prev => [...prev, ...names]);
  };

  const closeCelebration = () => {
    setCelebrationMatch(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        matchCount={matches.length}
      />

      <main className="pb-12">
        {currentView === 'swipe' && (
          <SwipeView
            names={allNames}
            nameSwipe={nameSwipe}
            onMatch={handleMatch}
            selectedOrigins={selectedOrigins}
            onOriginsChange={setSelectedOrigins}
            selectedGender={selectedGender}
            onGenderChange={setSelectedGender}
            onAddNames={handleAddDiscoveredNames}
            matches={matches}
          />
        )}

        {currentView === 'matches' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <MatchesList matches={matches} />
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
