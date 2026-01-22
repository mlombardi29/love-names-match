import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Sparkles } from 'lucide-react';
import { BabyName, CulturalOrigin, CULTURAL_ORIGINS } from '@/data/names';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AddNameFormProps {
  onAddName: (name: BabyName) => void;
  existingNames: BabyName[];
}

export const AddNameForm = ({ onAddName, existingNames }: AddNameFormProps) => {
  const [newName, setNewName] = useState('');
  const [selectedGender, setSelectedGender] = useState<'boy' | 'girl'>('girl');
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

    // Check if name already exists
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
      title: "Name added successfully!",
      description: `${newName.trim()} has been added to your list`,
    });

    setNewName('');
    setSelectedOrigins([]);
    setIsSubmitting(false);
  };

  return (
    <Card className="p-6 bg-gradient-soft border-0 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Add Custom Name</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter a beautiful name..."
            className="transition-all duration-200 focus:ring-2 focus:ring-primary"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Gender</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedGender('girl')}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
                ${selectedGender === 'girl'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
              disabled={isSubmitting}
            >
              <span className="text-lg">👧</span>
              Girl
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('boy')}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
                ${selectedGender === 'boy'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
              disabled={isSubmitting}
            >
              <span className="text-lg">👦</span>
              Boy
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Cultural Origins <span className="text-muted-foreground">(optional)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {CULTURAL_ORIGINS.slice(0, 8).map(({ value, label }) => (
              <Badge
                key={value}
                variant={selectedOrigins.includes(value) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
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
          className="w-full bg-gradient-warm hover:opacity-90 text-white font-medium py-3 transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Name'}
        </Button>
      </form>
    </Card>
  );
};
