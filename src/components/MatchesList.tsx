import { MatchedName } from '@/hooks/useNameSwipe';
import { Card } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';

interface MatchesListProps {
  matches: MatchedName[];
}

export const MatchesList = ({ matches }: MatchesListProps) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💕</div>
        <h3 className="text-2xl font-bold mb-2 text-foreground">No matches yet!</h3>
        <p className="text-muted-foreground">
          Keep swiping to find names you both love
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-foreground">Your Favorite Names</h2>
        <p className="text-muted-foreground">
          Names you both swiped right on • {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match, index) => {
          const genderColor = match.name.gender === 'girl' 
            ? 'from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20' 
            : 'from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20';

          return (
            <Card 
              key={match.name.id}
              className={`
                p-6 bg-gradient-to-br ${genderColor} border-0 shadow-card
                hover:shadow-celebration transition-all duration-300
                hover:scale-105
              `}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-love fill-current" />
                  <div className={`
                    inline-flex px-3 py-1 rounded-full text-sm font-medium
                    ${match.name.gender === 'girl' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    }
                  `}>
                    {match.name.gender === 'girl' ? '👧' : '👦'} {match.name.gender === 'girl' ? 'Girl' : 'Boy'}
                  </div>
                  <Heart className="w-5 h-5 text-love fill-current" />
                </div>

                <h3 className="text-2xl font-bold mb-2 text-foreground">
                  {match.name.name}
                </h3>

                {match.name.isCustom && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-3">
                    <Sparkles className="w-3 h-3" />
                    Custom Addition
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Matched {new Date(match.matchedAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};