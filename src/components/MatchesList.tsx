import { MatchedName } from '@/hooks/useNameSwipe';
import { Card } from '@/components/ui/card';
import { Heart, Star } from 'lucide-react';
import { MatchThemes } from './MatchThemes';

interface MatchesListProps {
  matches: MatchedName[];
  partner1Name?: string;
  partner2Name?: string;
  partnerAddedNameIds?: Set<string>;
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

const MatchCard = ({
  match,
  partner1Name,
  partner2Name,
  partnerAddedNameIds,
}: {
  match: MatchedName;
  partner1Name?: string;
  partner2Name?: string;
  partnerAddedNameIds?: Set<string>;
}) => {
  const genderStyle = getGenderStyle(match.name.gender);
  const matchLabel = getMatchLabel(match.partner1Decision, match.partner2Decision, partner1Name, partner2Name);
  const addedByPartner = partnerAddedNameIds?.has(match.name.id);

  return (
    <Card className={`p-5 ${genderStyle.bg} border border-border hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
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

        <div className="flex flex-wrap gap-1.5">
          {addedByPartner && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 text-xs font-medium">
              ✍️ Added by {partner2Name ?? 'partner'}
            </span>
          )}
          {match.name.isCustom && !addedByPartner && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">
              ✨ Custom
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Matched {new Date(match.matchedAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
};

export const MatchesList = ({ matches, partner1Name, partner2Name, partnerAddedNameIds }: MatchesListProps) => {
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

  const superMatches = matches.filter(m => m.partner1Decision === 'superlike' && m.partner2Decision === 'superlike');
  const regularMatches = matches.filter(m => !(m.partner1Decision === 'superlike' && m.partner2Decision === 'superlike'));

  const cardProps = { partner1Name, partner2Name, partnerAddedNameIds };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-1 text-foreground">Your Matches</h2>
        <p className="text-muted-foreground">
          {matches.length} name{matches.length !== 1 ? 's' : ''} you both loved
        </p>
      </div>

      <MatchThemes matches={matches} />

      {superMatches.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            ⭐⭐ Super Matches
            <span className="text-sm font-normal text-muted-foreground">— you both superliked these</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {superMatches.map(match => <MatchCard key={match.name.id} match={match} {...cardProps} />)}
          </div>
        </section>
      )}

      {regularMatches.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            ❤️ Matches
            {superMatches.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">— at least one of you superliked, or both liked</span>
            )}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regularMatches.map(match => <MatchCard key={match.name.id} match={match} {...cardProps} />)}
          </div>
        </section>
      )}
    </div>
  );
};
