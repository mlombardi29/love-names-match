import { Heart, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentView: 'swipe' | 'matches' | 'add';
  onViewChange: (view: 'swipe' | 'matches' | 'add') => void;
  matchCount: number;
}

export const Navigation = ({ currentView, onViewChange, matchCount }: NavigationProps) => {
  return (
    <nav className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">BabyNames</h1>
                <p className="text-xs text-muted-foreground">Find the perfect name together</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={currentView === 'swipe' ? 'default' : 'secondary'}
              onClick={() => onViewChange('swipe')}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Swipe</span>
            </Button>

            <Button
              variant={currentView === 'matches' ? 'default' : 'secondary'}
              onClick={() => onViewChange('matches')}
              className="flex items-center gap-2 relative"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Matches</span>
              {matchCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-love text-love-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {matchCount}
                </div>
              )}
            </Button>

            <Button
              variant={currentView === 'add' ? 'default' : 'secondary'}
              onClick={() => onViewChange('add')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};