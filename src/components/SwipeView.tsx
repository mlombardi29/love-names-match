import { BabyName, CulturalOrigin, Gender } from '@/data/names';
import { useNameSwipe } from '@/hooks/useNameSwipe';
import { NameCard } from './NameCard';
import { CultureFilter } from './CultureFilter';
import { GenderFilter } from './GenderFilter';
import { GetMoreNames } from './GetMoreNames';
import { Progress } from '@/components/ui/progress';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeViewProps {
  names: BabyName[];
  nameSwipe: ReturnType<typeof useNameSwipe>;
  onSwipe: (decision: 'like' | 'superlike' | 'pass') => void;
  selectedOrigins: CulturalOrigin[];
  onOriginsChange: (origins: CulturalOrigin[]) => void;
  selectedGender: Gender | 'all';
  onGenderChange: (gender: Gender | 'all') => void;
  onAddNames: (names: BabyName[]) => void;
  matches: any[];
  partnerName?: string;
  partnerPartnerName?: string;
}

export const SwipeView = ({ 
  names, 
  nameSwipe, 
  onSwipe,
  selectedOrigins, 
  onOriginsChange,
  selectedGender,
  onGenderChange,
  onAddNames,
  matches,
  partnerName,
}: SwipeViewProps) => {
  const {
    currentPartner,
    getCurrentName,
    getPartnerProgress,
    isComplete
  } = nameSwipe;

  const currentName = getCurrentName();

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            All done{partnerName ? `, ${partnerName}` : ''}!
          </h2>
          <p className="text-muted-foreground mb-8">
            You've reviewed all {names.length} names. Want to discover more?
          </p>
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
      {/* Current user indicator */}
      {partnerName && (
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
            Swiping as {partnerName}
          </span>
        </div>
      )}

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
          onSwipe={onSwipe}
        />
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-muted-foreground">
        Swipe right to like • Swipe left to pass • Tap ⭐ to superlike
      </p>
    </div>
  );
};
