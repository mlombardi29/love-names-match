import { MatchedName } from '@/hooks/useNameSwipe';
import { CULTURAL_ORIGINS, CulturalOrigin } from '@/data/names';
import { Card } from '@/components/ui/card';
import { TrendingUp, Globe, Type, Ruler, Music } from 'lucide-react';

interface MatchThemesProps {
  matches: MatchedName[];
}

interface ThemeAnalysis {
  cultures: { origin: CulturalOrigin; count: number; percentage: number }[];
  firstLetters: { letter: string; count: number; percentage: number }[];
  lengths: { length: number; count: number; percentage: number }[];
  syllables: { count: number; names: number; percentage: number }[];
}

const countSyllables = (name: string): number => {
  const word = name.toLowerCase();
  let count = 0;
  const vowels = 'aeiouy';
  let wasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !wasVowel) {
      count++;
    }
    wasVowel = isVowel;
  }

  // Handle silent 'e' at the end
  if (word.endsWith('e') && count > 1) {
    count--;
  }

  return Math.max(1, count);
};

const analyzeThemes = (matches: MatchedName[]): ThemeAnalysis => {
  const cultureCount: Record<CulturalOrigin, number> = {} as Record<CulturalOrigin, number>;
  const letterCount: Record<string, number> = {};
  const lengthCount: Record<number, number> = {};
  const syllableCount: Record<number, number> = {};

  matches.forEach(match => {
    // Count cultures
    match.name.origins?.forEach(origin => {
      cultureCount[origin] = (cultureCount[origin] || 0) + 1;
    });

    // Count first letters
    const firstLetter = match.name.name[0].toUpperCase();
    letterCount[firstLetter] = (letterCount[firstLetter] || 0) + 1;

    // Count name lengths
    const length = match.name.name.length;
    lengthCount[length] = (lengthCount[length] || 0) + 1;

    // Count syllables
    const syllables = countSyllables(match.name.name);
    syllableCount[syllables] = (syllableCount[syllables] || 0) + 1;
  });

  const total = matches.length;

  const cultures = Object.entries(cultureCount)
    .map(([origin, count]) => ({
      origin: origin as CulturalOrigin,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const firstLetters = Object.entries(letterCount)
    .map(([letter, count]) => ({
      letter,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const lengths = Object.entries(lengthCount)
    .map(([length, count]) => ({
      length: parseInt(length),
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const syllables = Object.entries(syllableCount)
    .map(([count, names]) => ({
      count: parseInt(count),
      names,
      percentage: Math.round((names / total) * 100)
    }))
    .sort((a, b) => b.names - a.names);

  return { cultures, firstLetters, lengths, syllables };
};

export const MatchThemes = ({ matches }: MatchThemesProps) => {
  if (matches.length < 2) {
    return null;
  }

  const themes = analyzeThemes(matches);

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Your Naming Style</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cultural Origins */}
        {themes.cultures.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Popular Origins
            </div>
            <div className="space-y-2">
              {themes.cultures.map(({ origin, count, percentage }) => (
                <div key={origin} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-foreground">
                        {CULTURAL_ORIGINS.find(c => c.value === origin)?.label || origin}
                      </span>
                      <span className="text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* First Letters */}
        {themes.firstLetters.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Type className="w-4 h-4 text-muted-foreground" />
              Favorite Starting Letters
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.firstLetters.map(({ letter, count, percentage }) => (
                <div 
                  key={letter}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full"
                >
                  <span className="font-bold text-foreground">{letter}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Name Lengths */}
        {themes.lengths.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              Name Length Preference
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.lengths.map(({ length, count }) => (
                <div 
                  key={length}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full"
                >
                  <span className="text-sm text-foreground">{length} letters</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Syllables */}
        {themes.syllables.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Music className="w-4 h-4 text-muted-foreground" />
              Syllable Pattern
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.syllables.map(({ count, names }) => (
                <div 
                  key={count}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full"
                >
                  <span className="text-sm text-foreground">
                    {count} syllable{count !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-muted-foreground">({names})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
