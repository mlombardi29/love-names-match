import { useState, useMemo } from 'react';
import { BabyName, createNameDatabase } from '@/data/names';
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
  const [celebrationMatch, setCelebrationMatch] = useState<MatchedName | null>(null);

  const allNames = useMemo(() => {
    return [...createNameDatabase(), ...customNames];
  }, [customNames]);

  const nameSwipe = useNameSwipe(allNames);
  const matches = nameSwipe.getMatches();

  const handleMatch = (match: MatchedName) => {
    setCelebrationMatch(match);
  };

  const handleAddName = (name: BabyName) => {
    setCustomNames(prev => [...prev, name]);
  };

  const closeCelebration = () => {
    setCelebrationMatch(null);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        matchCount={matches.length}
      />

      <main className="pb-8">
        {currentView === 'swipe' && (
          <SwipeView
            names={allNames}
            nameSwipe={nameSwipe}
            onMatch={handleMatch}
          />
        )}

        {currentView === 'matches' && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <MatchesList matches={matches} />
          </div>
        )}

        {currentView === 'add' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <AddNameForm onAddName={handleAddName} existingNames={allNames} />
          </div>
        )}
      </main>

      <CelebrationModal match={celebrationMatch} onClose={closeCelebration} />
    </div>
  );
};

export default Index;
