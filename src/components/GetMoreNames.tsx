import { useState } from 'react';
import { MatchedName } from '@/hooks/useNameSwipe';
import { BabyName, CulturalOrigin, CULTURAL_ORIGINS } from '@/data/names';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GetMoreNamesProps {
  matches: MatchedName[];
  onAddNames: (names: BabyName[]) => void;
  existingNames: BabyName[];
}

// Extended name lists organized by various categories for "discovering" more names
const ADDITIONAL_NAMES: Record<string, { name: string; gender: 'boy' | 'girl' | 'unisex'; origins: CulturalOrigin[] }[]> = {
  // Short names (≤4 letters)
  short: [
    { name: "Ivy", gender: 'girl', origins: ['english'] },
    { name: "Zoe", gender: 'girl', origins: ['greek'] },
    { name: "Max", gender: 'boy', origins: ['latin', 'german'] },
    { name: "Leo", gender: 'boy', origins: ['latin'] },
    { name: "Ava", gender: 'girl', origins: ['latin'] },
    { name: "Mia", gender: 'girl', origins: ['scandinavian'] },
    { name: "Ian", gender: 'boy', origins: ['irish'] },
    { name: "Eva", gender: 'girl', origins: ['hebrew'] },
    { name: "Ace", gender: 'boy', origins: ['english'] },
    { name: "Ada", gender: 'girl', origins: ['german'] },
    { name: "Rex", gender: 'boy', origins: ['latin'] },
    { name: "Joy", gender: 'girl', origins: ['english'] },
    { name: "Guy", gender: 'boy', origins: ['french'] },
    { name: "Amy", gender: 'girl', origins: ['french'] },
    { name: "Ray", gender: 'boy', origins: ['english'] },
  ],
  // Names starting with common letters (A, E, S, M)
  startsWithA: [
    { name: "Archer", gender: 'boy', origins: ['english'] },
    { name: "Arabella", gender: 'girl', origins: ['latin'] },
    { name: "August", gender: 'boy', origins: ['latin'] },
    { name: "Azalea", gender: 'girl', origins: ['greek'] },
    { name: "Atlas", gender: 'boy', origins: ['greek'] },
    { name: "Alma", gender: 'girl', origins: ['spanish', 'latin'] },
    { name: "Ansel", gender: 'boy', origins: ['german'] },
    { name: "Alina", gender: 'girl', origins: ['slavic'] },
  ],
  startsWithE: [
    { name: "Ezekiel", gender: 'boy', origins: ['hebrew'] },
    { name: "Estelle", gender: 'girl', origins: ['french'] },
    { name: "Ellis", gender: 'unisex', origins: ['english'] },
    { name: "Elodie", gender: 'girl', origins: ['french'] },
    { name: "Edmund", gender: 'boy', origins: ['english'] },
    { name: "Esme", gender: 'girl', origins: ['french'] },
    { name: "Emeric", gender: 'boy', origins: ['german'] },
    { name: "Estella", gender: 'girl', origins: ['spanish'] },
  ],
  // Cultural-specific names
  hebrew: [
    { name: "Ezekiel", gender: 'boy', origins: ['hebrew'] },
    { name: "Miriam", gender: 'girl', origins: ['hebrew'] },
    { name: "Jonah", gender: 'boy', origins: ['hebrew'] },
    { name: "Talya", gender: 'girl', origins: ['hebrew'] },
    { name: "Gideon", gender: 'boy', origins: ['hebrew'] },
    { name: "Shira", gender: 'girl', origins: ['hebrew'] },
    { name: "Reuben", gender: 'boy', origins: ['hebrew'] },
    { name: "Nava", gender: 'girl', origins: ['hebrew'] },
  ],
  irish: [
    { name: "Declan", gender: 'boy', origins: ['irish'] },
    { name: "Saoirse", gender: 'girl', origins: ['irish'] },
    { name: "Cillian", gender: 'boy', origins: ['irish'] },
    { name: "Siobhan", gender: 'girl', origins: ['irish'] },
    { name: "Seamus", gender: 'boy', origins: ['irish'] },
    { name: "Aisling", gender: 'girl', origins: ['irish'] },
    { name: "Fionn", gender: 'boy', origins: ['irish'] },
    { name: "Clodagh", gender: 'girl', origins: ['irish'] },
  ],
  greek: [
    { name: "Apollo", gender: 'boy', origins: ['greek'] },
    { name: "Calliope", gender: 'girl', origins: ['greek'] },
    { name: "Orion", gender: 'boy', origins: ['greek'] },
    { name: "Phoebe", gender: 'girl', origins: ['greek'] },
    { name: "Perseus", gender: 'boy', origins: ['greek'] },
    { name: "Iris", gender: 'girl', origins: ['greek'] },
    { name: "Evander", gender: 'boy', origins: ['greek'] },
    { name: "Daphne", gender: 'girl', origins: ['greek'] },
  ],
  latin: [
    { name: "Felix", gender: 'boy', origins: ['latin'] },
    { name: "Aurora", gender: 'girl', origins: ['latin'] },
    { name: "Magnus", gender: 'boy', origins: ['latin'] },
    { name: "Clara", gender: 'girl', origins: ['latin'] },
    { name: "Aurelius", gender: 'boy', origins: ['latin'] },
    { name: "Celeste", gender: 'girl', origins: ['latin'] },
    { name: "Cassius", gender: 'boy', origins: ['latin'] },
    { name: "Cordelia", gender: 'girl', origins: ['latin'] },
  ],
  japanese: [
    { name: "Haruki", gender: 'boy', origins: ['japanese'] },
    { name: "Hana", gender: 'girl', origins: ['japanese'] },
    { name: "Ren", gender: 'unisex', origins: ['japanese'] },
    { name: "Yui", gender: 'girl', origins: ['japanese'] },
    { name: "Akira", gender: 'unisex', origins: ['japanese'] },
    { name: "Emi", gender: 'girl', origins: ['japanese'] },
    { name: "Daiki", gender: 'boy', origins: ['japanese'] },
    { name: "Mio", gender: 'girl', origins: ['japanese'] },
  ],
  scandinavian: [
    { name: "Bjorn", gender: 'boy', origins: ['scandinavian'] },
    { name: "Astrid", gender: 'girl', origins: ['scandinavian'] },
    { name: "Leif", gender: 'boy', origins: ['scandinavian'] },
    { name: "Sigrid", gender: 'girl', origins: ['scandinavian'] },
    { name: "Soren", gender: 'boy', origins: ['scandinavian'] },
    { name: "Liv", gender: 'girl', origins: ['scandinavian'] },
    { name: "Viggo", gender: 'boy', origins: ['scandinavian'] },
    { name: "Frida", gender: 'girl', origins: ['scandinavian'] },
  ],
  // Nature-inspired
  nature: [
    { name: "River", gender: 'unisex', origins: ['english'] },
    { name: "Willow", gender: 'girl', origins: ['english'] },
    { name: "Forrest", gender: 'boy', origins: ['english'] },
    { name: "Ivy", gender: 'girl', origins: ['english'] },
    { name: "Ocean", gender: 'unisex', origins: ['english'] },
    { name: "Fern", gender: 'girl', origins: ['english'] },
    { name: "Stone", gender: 'boy', origins: ['english'] },
    { name: "Meadow", gender: 'girl', origins: ['english'] },
    { name: "Wolf", gender: 'boy', origins: ['german', 'english'] },
    { name: "Flora", gender: 'girl', origins: ['latin'] },
  ],
  // Modern/Trendy
  modern: [
    { name: "Jaxon", gender: 'boy', origins: ['english'] },
    { name: "Nova", gender: 'girl', origins: ['latin'] },
    { name: "Knox", gender: 'boy', origins: ['english'] },
    { name: "Luna", gender: 'girl', origins: ['latin'] },
    { name: "Crew", gender: 'boy', origins: ['english'] },
    { name: "Wren", gender: 'girl', origins: ['english'] },
    { name: "Bodhi", gender: 'boy', origins: ['indian'] },
    { name: "Sloane", gender: 'girl', origins: ['irish'] },
  ],
};

const analyzeMatchTrends = (matches: MatchedName[]): string[] => {
  const trends: string[] = [];
  
  if (matches.length === 0) {
    return ['modern', 'nature', 'short'];
  }

  // Analyze average name length
  const avgLength = matches.reduce((sum, m) => sum + m.name.name.length, 0) / matches.length;
  if (avgLength <= 4) trends.push('short');

  // Analyze common starting letters
  const startLetters: Record<string, number> = {};
  matches.forEach(m => {
    const letter = m.name.name[0].toLowerCase();
    startLetters[letter] = (startLetters[letter] || 0) + 1;
  });
  const topLetter = Object.entries(startLetters).sort((a, b) => b[1] - a[1])[0];
  if (topLetter && topLetter[1] >= 2) {
    if (topLetter[0] === 'a') trends.push('startsWithA');
    if (topLetter[0] === 'e') trends.push('startsWithE');
  }

  // Analyze cultural origins
  const originCounts: Record<string, number> = {};
  matches.forEach(m => {
    m.name.origins?.forEach(origin => {
      originCounts[origin] = (originCounts[origin] || 0) + 1;
    });
  });
  const topOrigins = Object.entries(originCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([origin]) => origin);
  
  topOrigins.forEach(origin => {
    if (ADDITIONAL_NAMES[origin]) {
      trends.push(origin);
    }
  });

  // Add some variety
  if (!trends.includes('nature')) trends.push('nature');
  if (!trends.includes('modern')) trends.push('modern');

  return trends.slice(0, 4);
};

export const GetMoreNames = ({ matches, onAddNames, existingNames }: GetMoreNamesProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const trends = analyzeMatchTrends(matches);

  const handleGetMoreNames = async () => {
    setIsLoading(true);

    // Simulate "searching" for names
    await new Promise(resolve => setTimeout(resolve, 1500));

    const existingNameStrings = new Set(existingNames.map(n => n.name.toLowerCase()));
    const newNames: BabyName[] = [];

    trends.forEach(trend => {
      const trendNames = ADDITIONAL_NAMES[trend] || [];
      trendNames.forEach(nameData => {
        if (!existingNameStrings.has(nameData.name.toLowerCase()) && 
            !newNames.some(n => n.name.toLowerCase() === nameData.name.toLowerCase())) {
          newNames.push({
            id: `discovered-${Date.now()}-${nameData.name}`,
            name: nameData.name,
            gender: nameData.gender,
            origins: nameData.origins,
            isCustom: false
          });
        }
      });
    });

    // Take a random selection of up to 30 names
    const shuffled = newNames.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 30);

    if (selected.length > 0) {
      onAddNames(selected);
      toast({
        title: `Found ${selected.length} new names!`,
        description: "Based on your preferences, we've added more names to discover.",
      });
    } else {
      toast({
        title: "No new names found",
        description: "You've already seen all available names in these categories.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const trendLabels: Record<string, string> = {
    short: 'Short Names',
    startsWithA: 'Names Starting with A',
    startsWithE: 'Names Starting with E',
    hebrew: 'Hebrew Names',
    irish: 'Irish Names',
    greek: 'Greek Names',
    latin: 'Latin Names',
    japanese: 'Japanese Names',
    scandinavian: 'Scandinavian Names',
    nature: 'Nature-Inspired',
    modern: 'Modern & Trendy',
  };

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Discover More Names
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Based on your matches, we'll find similar names you might love.
        </p>

        {trends.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Looking for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {trends.map(trend => (
                <span 
                  key={trend}
                  className="px-3 py-1 bg-muted rounded-full text-sm text-foreground"
                >
                  {trendLabels[trend] || trend}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={handleGetMoreNames}
          disabled={isLoading}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get More Names
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
