import { useEffect, useState } from 'react';
import { MatchedName } from '@/hooks/useNameSwipe';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Heart, Sparkles, Star } from 'lucide-react';

interface CelebrationModalProps {
  match: MatchedName | null;
  onClose: () => void;
}

export const CelebrationModal = ({ match, onClose }: CelebrationModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (match) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [match, onClose]);

  if (!match) return null;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-md mx-auto bg-gradient-celebration border-0 text-center overflow-hidden">
        <div className="relative p-8">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random()}s`
                }}
              >
                {match.isSuperMatch ? (
                  <Star className="w-4 h-4 text-superlike fill-current opacity-80" />
                ) : Math.random() > 0.5 ? (
                  <Heart className="w-4 h-4 text-like fill-current opacity-60" />
                ) : (
                  <Sparkles className="w-4 h-4 text-accent opacity-60" />
                )}
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-pulse">
              {match.isSuperMatch ? '⭐' : '🎉'}
            </div>
            
            <h2 className="text-3xl font-bold mb-2 text-white">
              {match.isSuperMatch ? 'Super Match!' : "It's a Match!"}
            </h2>
            
            <p className="text-lg text-white/90 mb-6">
              {match.isSuperMatch 
                ? 'Someone superliked this name!' 
                : 'You both like the name'}
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <div className={`
                inline-flex px-4 py-2 rounded-full text-sm font-medium mb-3
                ${match.name.gender === 'girl' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                }
              `}>
                {match.name.gender === 'girl' ? '👧' : '👦'} {match.name.gender === 'girl' ? 'Girl' : 'Boy'}
              </div>
              
              <h3 className="text-4xl font-bold text-white mb-2">
                {match.name.name}
              </h3>
              
              {match.name.isCustom && (
                <div className="inline-flex px-3 py-1 rounded-full bg-white/30 text-white text-xs font-medium">
                  ✨ Custom Addition
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-white/80">
              {match.isSuperMatch ? (
                <>
                  <Star className="w-5 h-5 fill-current text-superlike" />
                  <span className="font-medium">Added to your favorites!</span>
                  <Star className="w-5 h-5 fill-current text-superlike" />
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-current text-like" />
                  <span className="font-medium">Added to your favorites!</span>
                  <Heart className="w-5 h-5 fill-current text-like" />
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};