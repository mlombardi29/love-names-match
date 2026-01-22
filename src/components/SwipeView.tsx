import { BabyName, CulturalOrigin, Gender } from '@/data/names';
import { useNameSwipe } from '@/hooks/useNameSwipe';
import { NameCard } from './NameCard';
import { PartnerSelector } from './PartnerSelector';
import { CultureFilter } from './CultureFilter';
import { GenderFilter } from './GenderFilter';
import { GetMoreNames } from './GetMoreNames';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeViewProps {
  names: BabyName[];
  nameSwipe: ReturnType<typeof useNameSwipe>;
  onMatch: (match: any) => void;
  selectedOrigins: CulturalOrigin[];
  onOriginsChange: (origins: CulturalOrigin[]) => void;
  selectedGender: Gender | 'all';
  onGenderChange: (gender: Gender | 'all') => void;
  onAddNames: (names: BabyName[]) => void;
  matches: any[];
}

export const SwipeView = ({ 
  names, 
  nameSwipe, 
  onMatch, 
  selectedOrigins, 
  onOriginsChange,
  selectedGender,
  onGenderChange,
  onAddNames,
  matches
}: SwipeViewProps) => {
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

  const handleSwipe = (decision: 'like' | 'superlike' | 'pass') => {
    const match = swipeOnName(decision);
    if (match) {
      onMatch(match);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            All done, {currentPartner === 'partner1' ? 'Partner 1' : 'Partner 2'}!
          </h2>
          <p className="text-muted-foreground mb-8">
            You've reviewed all {names.length} names. Want to discover more?
          </p>
          <div className="flex gap-3 justify-center mb-12">
            <Button onClick={() => switchPartner()} variant="outline" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Switch Partner
            </Button>
            <Button onClick={handleRestart} size="lg">
              <Heart className="w-4 h-4 mr-2" />
              Start Fresh
            </Button>
          </div>
        </div>

        <GetMoreNames 
          matches={matches} 
          onAddNames={onAddNames}
          existingNames={names}
        />
      </div>
    );
  }

  if (!currentName) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">No names to show</h2>
        <p className="text-muted-foreground">
          Try adjusting your filters or add custom names.
        </p>
      </div>
    );
  }

  const currentProgress = getPartnerProgress(currentPartner);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PartnerSelector
        currentPartner={currentPartner}
        onPartnerChange={switchPartner}
        partner1Progress={partner1Progress}
        partner2Progress={partner2Progress}
      />

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <GenderFilter 
          selectedGender={selectedGender}
          onGenderChange={onGenderChange}
        />
        <div className="flex items-center gap-3">
          <CultureFilter 
            selectedOrigins={selectedOrigins} 
            onOriginsChange={onOriginsChange} 
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {names.length} names
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {currentProgress.current} of {currentProgress.total}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(currentProgress.percentage)}% complete
          </span>
        </div>
        <Progress value={currentProgress.percentage} className="h-1.5" />
      </div>

      {/* Card */}
      <div className="flex justify-center mb-6">
        <NameCard
          name={currentName}
          onSwipe={handleSwipe}
        />
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-muted-foreground">
        Swipe right to like • Swipe left to pass • Tap ⭐ to superlike
      </p>
    </div>
  );
};
