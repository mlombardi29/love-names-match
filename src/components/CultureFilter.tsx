import { CulturalOrigin, CULTURAL_ORIGINS } from '@/data/names';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CultureFilterProps {
  selectedOrigins: CulturalOrigin[];
  onOriginsChange: (origins: CulturalOrigin[]) => void;
}

export const CultureFilter = ({ selectedOrigins, onOriginsChange }: CultureFilterProps) => {
  const toggleOrigin = (origin: CulturalOrigin) => {
    if (selectedOrigins.includes(origin)) {
      onOriginsChange(selectedOrigins.filter(o => o !== origin));
    } else {
      onOriginsChange([...selectedOrigins, origin]);
    }
  };

  const clearAll = () => {
    onOriginsChange([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter by Culture
          {selectedOrigins.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {selectedOrigins.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Cultural Origins</h4>
            {selectedOrigins.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="h-auto py-1 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Select origins to filter names
          </p>
        </div>
        <ScrollArea className="h-64">
          <div className="p-4 flex flex-wrap gap-2">
            {CULTURAL_ORIGINS.map(({ value, label }) => (
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
        </ScrollArea>
        {selectedOrigins.length > 0 && (
          <div className="p-4 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Showing names from: {selectedOrigins.map(o => 
                CULTURAL_ORIGINS.find(c => c.value === o)?.label
              ).join(', ')}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
