import { MatchedName } from '@/hooks/useNameSwipe';
import { Card } from '@/components/ui/card';
import { Heart, Star } from 'lucide-react';
import { MatchThemes } from './MatchThemes';

interface MatchesListProps {
  matches: MatchedName[];
  partner1Name?: string;
  partner2Name?: string;
}

const getMatchLabel = (p1: string, p2: string, p1Name?: string, p2Name?: string): { text: string; icon: 'double-like' | 'double-superlike' | 'mixed' } => {
  const name1 = p1Name || 'Partner 1';
  const name2 = p2Name || 'Partner 2';
  
  if (p1 === 'superlike' && p2 === 'superlike') {
    return { text: 'Both Superliked! ⭐⭐', icon: 'double-superlike' };
  }
  if (p1 === 'like' && p2 === 'like') {
    return { text: 'Both Liked ❤️❤️', icon: 'double-like' };
  }
  if (p1 === 'superlike') {
    return { text: `${name1} Superliked ⭐, ${name2} Liked ❤️`, icon: 'mixed' };
  }
  return { text: `${name1} Liked ❤️, ${name2} Superliked ⭐`, icon: 'mixed' };
};

const getGenderStyle = (gender: string) => {
  switch (gender) {
    case 'girl':
      return { bg: 'bg-pink-50 dark:bg-pink-950/30', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300', emoji: '👧', label: 'Girl' };
    case 'boy':
      return { bg: 'bg-blue-50 dark:bg-blue-950/30', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', emoji: '👦', label: 'Boy' };
    case 'unisex':
      return { bg: 'bg-purple-50 dark:bg-purple-950/30', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300', emoji: '✨', label: 'Unisex' };
    default:
      return { bg: 'bg-muted', badge: 'bg-muted text-muted-foreground', emoji: '👶', label: 'Unknown' };
  }
};

export const MatchesList = ({ matches, partner1Name, partner2Name }: MatchesListProps) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2 text-foreground">No matches yet!</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Keep swiping to find names you both love. When you match, you'll see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-1 text-foreground">Your Matches</h2>
        <p className="text-muted-foreground">
          {matches.length} name{matches.length !== 1 ? 's' : ''} you both loved
        </p>
      </div>

      <MatchThemes matches={matches} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => {
          const genderStyle = getGenderStyle(match.name.gender);
          const matchLabel = getMatchLabel(match.partner1Decision, match.partner2Decision, partner1Name, partner2Name);

          return (
            <Card 
              key={match.name.id}
              className={`p-5 ${genderStyle.bg} border border-border hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${genderStyle.badge}`}>
                    {genderStyle.emoji} {genderStyle.label}
                  </span>
                  {match.isSuperMatch && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-foreground">{match.name.name}</h3>

                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  matchLabel.icon === 'double-superlike' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                    : matchLabel.icon === 'double-like'
                    ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300'
                    : 'bg-gradient-to-r from-pink-100 to-yellow-100 text-pink-800 dark:from-pink-900/50 dark:to-yellow-900/50 dark:text-pink-300'
                }`}>
                  {matchLabel.text}
                </div>

                {match.name.isCustom && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">
                    ✨ Custom
                  </span>
                )}

                <p className="text-xs text-muted-foreground">
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
