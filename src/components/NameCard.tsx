import { useState } from 'react';
import { BabyName } from '@/data/names';
import { Card } from '@/components/ui/card';
import { Heart, X } from 'lucide-react';

interface NameCardProps {
  name: BabyName;
  onSwipe: (decision: 'love' | 'pass') => void;
  className?: string;
}

export const NameCard = ({ name, onSwipe, className = '' }: NameCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (decision: 'love' | 'pass') => {
    setIsAnimating(true);
    setSwipeDirection(decision === 'love' ? 'right' : 'left');
    
    setTimeout(() => {
      onSwipe(decision);
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 300);
  };

  const genderColor = name.gender === 'girl' ? 'from-pink-100 to-purple-100' : 'from-blue-100 to-cyan-100';
  const genderColorDark = name.gender === 'girl' ? 'dark:from-pink-900/20 dark:to-purple-900/20' : 'dark:from-blue-900/20 dark:to-cyan-900/20';

  return (
    <Card 
      className={`
        relative w-80 h-96 mx-auto cursor-pointer transition-all duration-300
        bg-gradient-to-br ${genderColor} ${genderColorDark}
        shadow-card hover:shadow-celebration border-0
        ${isAnimating ? (swipeDirection === 'right' ? 'translate-x-full rotate-12' : '-translate-x-full -rotate-12') : ''}
        ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        ${className}
      `}
    >
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="mb-6">
          <div className={`
            inline-flex px-4 py-2 rounded-full text-sm font-medium
            ${name.gender === 'girl' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }
          `}>
            {name.gender === 'girl' ? '👧' : '👦'} {name.gender === 'girl' ? 'Girl' : 'Boy'}
          </div>
        </div>

        <h2 className="text-5xl font-bold mb-4 text-foreground leading-tight">
          {name.name}
        </h2>

        {name.isCustom && (
          <div className="inline-flex px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
            ✨ Custom Addition
          </div>
        )}

        <div className="flex gap-4 mt-auto">
          <button
            onClick={() => handleSwipe('pass')}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-pass hover:bg-pass/80 text-pass-foreground transition-all duration-200 hover:scale-110 shadow-lg"
            disabled={isAnimating}
          >
            <X size={24} />
          </button>
          <button
            onClick={() => handleSwipe('love')}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-love hover:bg-love/80 text-love-foreground transition-all duration-200 hover:scale-110 shadow-lg"
            disabled={isAnimating}
          >
            <Heart size={24} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Swipe hint overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-8 transform -translate-y-1/2 opacity-30">
          <div className="flex items-center gap-2 text-pass">
            <X size={32} />
            <span className="font-bold text-lg">PASS</span>
          </div>
        </div>
        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 opacity-30">
          <div className="flex items-center gap-2 text-love">
            <Heart size={32} fill="currentColor" />
            <span className="font-bold text-lg">LOVE</span>
          </div>
        </div>
      </div>
    </Card>
  );
};