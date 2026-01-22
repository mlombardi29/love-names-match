import { useState, useRef } from 'react';
import { BabyName } from '@/data/names';
import { Card } from '@/components/ui/card';
import { Heart, X, Star } from 'lucide-react';

interface NameCardProps {
  name: BabyName;
  onSwipe: (decision: 'like' | 'superlike' | 'pass') => void;
  className?: string;
}

const getGenderStyles = (gender: string) => {
  switch (gender) {
    case 'girl':
      return {
        gradient: 'from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40',
        badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300',
        emoji: '👧',
        label: 'Girl'
      };
    case 'boy':
      return {
        gradient: 'from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
        emoji: '👦',
        label: 'Boy'
      };
    case 'unisex':
      return {
        gradient: 'from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40',
        badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
        emoji: '✨',
        label: 'Unisex'
      };
    default:
      return {
        gradient: 'from-gray-50 to-slate-50 dark:from-gray-950/40 dark:to-slate-950/40',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/60 dark:text-gray-300',
        emoji: '👶',
        label: 'Baby'
      };
  }
};

export const NameCard = ({ name, onSwipe, className = '' }: NameCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const genderStyles = getGenderStyles(name.gender);

  const handleSwipe = (decision: 'like' | 'superlike' | 'pass') => {
    setIsAnimating(true);
    setSwipeDirection(decision === 'like' ? 'right' : decision === 'superlike' ? 'up' : 'left');
    
    setTimeout(() => {
      onSwipe(decision);
      setIsAnimating(false);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 250);
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    
    if (dragOffset.x > threshold) {
      handleSwipe('like');
    } else if (dragOffset.x < -threshold) {
      handleSwipe('pass');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const rotation = isDragging ? dragOffset.x * 0.08 : 0;
  const likeOpacity = Math.min(1, Math.max(0, dragOffset.x / 100));
  const passOpacity = Math.min(1, Math.max(0, -dragOffset.x / 100));

  const getAnimationTransform = () => {
    if (isAnimating) {
      if (swipeDirection === 'right') return 'translateX(120%) rotate(15deg)';
      if (swipeDirection === 'left') return 'translateX(-120%) rotate(-15deg)';
      if (swipeDirection === 'up') return 'translateY(-120%) scale(1.05)';
    }
    if (isDragging) {
      return `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`;
    }
    return 'translateX(0) translateY(0) rotate(0)';
  };

  return (
    <div
      className="relative select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card 
        ref={cardRef}
        className={`
          relative w-80 h-[420px] mx-auto cursor-grab active:cursor-grabbing
          bg-gradient-to-br ${genderStyles.gradient}
          border border-border rounded-2xl overflow-hidden
          ${isAnimating ? 'duration-250 ease-out' : isDragging ? 'duration-0' : 'duration-150'}
          ${className}
        `}
        style={{
          transform: getAnimationTransform(),
          opacity: isAnimating ? 0 : 1,
          boxShadow: isDragging 
            ? '0 20px 40px rgba(0, 0, 0, 0.15)' 
            : '0 8px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Swipe indicators */}
        <div 
          className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-pass text-pass-foreground font-bold text-lg border-2 border-pass/50 transition-opacity pointer-events-none"
          style={{ opacity: passOpacity, transform: 'rotate(-15deg)' }}
        >
          NOPE
        </div>
        <div 
          className="absolute top-6 right-6 px-4 py-2 rounded-lg bg-like text-like-foreground font-bold text-lg border-2 border-like/50 transition-opacity pointer-events-none"
          style={{ opacity: likeOpacity, transform: 'rotate(15deg)' }}
        >
          LIKE
        </div>

        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          {/* Gender badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${genderStyles.badge}`}>
              {genderStyles.emoji} {genderStyles.label}
            </span>
          </div>

          {/* Name */}
          <h2 className="text-5xl font-bold mb-4 text-foreground tracking-tight">
            {name.name}
          </h2>

          {/* Origins */}
          {name.origins && name.origins.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center mb-4 max-w-[260px]">
              {name.origins.slice(0, 3).map((origin) => (
                <span 
                  key={origin} 
                  className="px-2.5 py-1 rounded-full bg-card/80 text-muted-foreground text-xs capitalize border border-border"
                >
                  {origin}
                </span>
              ))}
            </div>
          )}

          {/* Custom badge */}
          {name.isCustom && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 text-xs font-medium mb-4">
              ✨ Custom
            </span>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('pass'); }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-card border-2 border-border text-muted-foreground hover:border-pass hover:text-pass transition-all duration-200 hover:scale-110"
              disabled={isAnimating}
            >
              <X size={26} strokeWidth={2.5} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('superlike'); }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-superlike text-superlike-foreground transition-all duration-200 hover:scale-110 shadow-lg"
              disabled={isAnimating}
            >
              <Star size={26} fill="currentColor" strokeWidth={0} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('like'); }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-like text-like-foreground transition-all duration-200 hover:scale-110 shadow-lg"
              disabled={isAnimating}
            >
              <Heart size={26} fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
