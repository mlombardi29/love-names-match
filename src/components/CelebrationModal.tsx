import { useEffect, useState } from 'react';
import { MatchedName } from '@/hooks/useNameSwipe';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Heart, Sparkles, Star } from 'lucide-react';

interface CelebrationModalProps {
  match: MatchedName | null;
  onClose: () => void;
}

const getGenderStyle = (gender: string) => {
  switch (gender) {
    case 'girl':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300';
    case 'boy':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300';
    case 'unisex':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getGenderEmoji = (gender: string) => {
  switch (gender) {
    case 'girl': return '👧';
    case 'boy': return '👦';
    case 'unisex': return '✨';
    default: return '👶';
  }
};

const getGenderLabel = (gender: string) => {
  switch (gender) {
    case 'girl': return 'Girl';
    case 'boy': return 'Boy';
    case 'unisex': return 'Unisex';
    default: return 'Baby';
  }
};

export const CelebrationModal = ({ match, onClose }: CelebrationModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (match) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 200);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [match, onClose]);

  if (!match) return null;

  const matchLabel = match.partner1Decision === 'superlike' && match.partner2Decision === 'superlike'
    ? 'Both Superliked!'
    : match.partner1Decision === 'superlike' || match.partner2Decision === 'superlike'
    ? 'Someone Superliked!'
    : 'You both liked this name!';

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-sm mx-auto bg-gradient-to-br from-primary to-pink-500 border-0 text-center overflow-hidden rounded-2xl">
        <div className="relative py-8 px-6">
          {/* Floating icons */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce opacity-60"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random()}s`
                }}
              >
                {match.isSuperMatch ? (
                  <Star className="w-4 h-4 text-yellow-300 fill-current" />
                ) : (
                  <Heart className="w-4 h-4 text-white fill-current" />
                )}
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <div className="text-6xl mb-4">
              {match.isSuperMatch ? '⭐' : '🎉'}
            </div>
            
            <h2 className="text-2xl font-bold mb-1 text-white">
              It's a Match!
            </h2>
            
            <p className="text-white/80 mb-6 text-sm">
              {matchLabel}
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getGenderStyle(match.name.gender)}`}>
                {getGenderEmoji(match.name.gender)} {getGenderLabel(match.name.gender)}
              </span>
              
              <h3 className="text-4xl font-bold text-white mb-2">
                {match.name.name}
              </h3>
              
              {match.name.isCustom && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/30 text-white text-xs">
                  ✨ Custom
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 text-white/80">
              {match.isSuperMatch ? (
                <>
                  <Star className="w-4 h-4 fill-current text-yellow-300" />
                  <span className="text-sm font-medium">Super Match!</span>
                  <Star className="w-4 h-4 fill-current text-yellow-300" />
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">Added to favorites</span>
                  <Heart className="w-4 h-4 fill-current" />
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
