import { BabyName } from '@/data/names';
import { useNameSwipe } from '@/hooks/useNameSwipe';
import { NameCard } from './NameCard';
import { PartnerSelector } from './PartnerSelector';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeViewProps {
  names: BabyName[];
  nameSwipe: ReturnType<typeof useNameSwipe>;
  onMatch: (match: any) => void;
}

export const SwipeView = ({ names, nameSwipe, onMatch }: SwipeViewProps) => {
  const {
    currentPartner,
    getCurrentName,
    swipeOnName,
    switchPartner,
    getPartnerProgress,
    isComplete
  } = nameSwipe;

  const currentName = getCurrentName();
  const partner1Progress = getPartnerProgress('partner1');
  const partner2Progress = getPartnerProgress('partner2');

  const handleSwipe = (decision: 'love' | 'pass') => {
    const match = swipeOnName(decision);
    if (match) {
      onMatch(match);
    }
  };

  const handleRestart = () => {
    window.location.reload(); // Simple restart for demo
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          {currentPartner === 'partner1' ? 'Partner 1' : 'Partner 2'} is done!
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          You've gone through all {names.length} names. Check your matches or switch to the other partner.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => switchPartner()} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Switch Partner
          </Button>
          <Button onClick={handleRestart} variant="default">
            <Heart className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  if (!currentName) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-6">💕</div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">No more names!</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Add some custom names to continue swiping.
        </p>
      </div>
    );
  }

  const currentProgress = getPartnerProgress(currentPartner);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PartnerSelector
        currentPartner={currentPartner}
        onPartnerChange={switchPartner}
        partner1Progress={partner1Progress}
        partner2Progress={partner2Progress}
      />

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Progress: {currentProgress.current} / {currentProgress.total}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(currentProgress.percentage)}%
          </span>
        </div>
        <Progress value={currentProgress.percentage} className="h-2" />
      </div>

      <div className="flex justify-center">
        <NameCard
          name={currentName}
          onSwipe={handleSwipe}
        />
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Swipe right (❤️) if you love the name, left (✖️) to pass</p>
      </div>
    </div>
  );
};