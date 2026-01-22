import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Sparkles } from 'lucide-react';
import { BabyName, CulturalOrigin, Gender, CULTURAL_ORIGINS } from '@/data/names';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AddNameFormProps {
  onAddName: (name: BabyName) => void;
  existingNames: BabyName[];
}

export const AddNameForm = ({ onAddName, existingNames }: AddNameFormProps) => {
  const [newName, setNewName] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender>('girl');
  const [selectedOrigins, setSelectedOrigins] = useState<CulturalOrigin[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const toggleOrigin = (origin: CulturalOrigin) => {
    if (selectedOrigins.includes(origin)) {
      setSelectedOrigins(selectedOrigins.filter(o => o !== origin));
    } else {
      setSelectedOrigins([...selectedOrigins, origin]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name to add",
        variant: "destructive",
      });
      return;
    }

    const nameExists = existingNames.some(
      name => name.name.toLowerCase() === newName.trim().toLowerCase()
    );

    if (nameExists) {
      toast({
        title: "Name already exists",
        description: "This name is already in your list",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const customName: BabyName = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      gender: selectedGender,
      origins: selectedOrigins.length > 0 ? selectedOrigins : ['english'],
      isCustom: true,
    };

    onAddName(customName);
    
    toast({
      title: "Name added!",
      description: `${newName.trim()} has been added to your list`,
    });

    setNewName('');
    setSelectedOrigins([]);
    setIsSubmitting(false);
  };

  const genderOptions: { value: Gender; label: string; emoji: string }[] = [
    { value: 'girl', label: 'Girl', emoji: '👧' },
    { value: 'boy', label: 'Boy', emoji: '👦' },
    { value: 'unisex', label: 'Unisex', emoji: '✨' },
  ];

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Add Custom Name</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter a name..."
            className="h-12 text-base"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Gender</Label>
          <div className="flex gap-2">
            {genderOptions.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedGender(value)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${selectedGender === value
                    ? value === 'girl' 
                      ? 'bg-pink-100 text-pink-700 border-2 border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700'
                      : value === 'boy'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700'
                      : 'bg-violet-100 text-violet-700 border-2 border-violet-300 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-700'
                    : 'bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80'
                  }
                `}
                disabled={isSubmitting}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Cultural Origins <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {CULTURAL_ORIGINS.map(({ value, label }) => (
              <Badge
                key={value}
                variant={selectedOrigins.includes(value) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => toggleOrigin(value)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !newName.trim()}
          size="lg"
          className="w-full h-12 text-base font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Name'}
        </Button>
      </form>
    </Card>
  );
};
