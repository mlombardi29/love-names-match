import { useState, useRef } from 'react';
import { BabyName } from '@/data/names';
import { Card } from '@/components/ui/card';
import { Heart, X, Star } from 'lucide-react';

interface NameCardProps {
  name: BabyName;
  onSwipe: (decision: 'like' | 'superlike' | 'pass') => void;
  className?: string;
}

export const NameCard = ({ name, onSwipe, className = '' }: NameCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleSwipe = (decision: 'like' | 'superlike' | 'pass') => {
    setIsAnimating(true);
    setSwipeDirection(decision === 'like' ? 'right' : decision === 'superlike' ? 'up' : 'left');
    
    setTimeout(() => {
      onSwipe(decision);
      setIsAnimating(false);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
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

  // Mouse events
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

  // Touch events
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

  const genderColor = name.gender === 'girl' ? 'from-pink-100 to-purple-100' : 'from-blue-100 to-cyan-100';
  const genderColorDark = name.gender === 'girl' ? 'dark:from-pink-900/20 dark:to-purple-900/20' : 'dark:from-blue-900/20 dark:to-cyan-900/20';

  const rotation = isDragging ? dragOffset.x * 0.1 : 0;
  const likeOpacity = Math.min(1, Math.max(0, dragOffset.x / 100));
  const passOpacity = Math.min(1, Math.max(0, -dragOffset.x / 100));

  const getAnimationTransform = () => {
    if (isAnimating) {
      if (swipeDirection === 'right') return 'translateX(150%) rotate(20deg)';
      if (swipeDirection === 'left') return 'translateX(-150%) rotate(-20deg)';
      if (swipeDirection === 'up') return 'translateY(-150%) scale(1.1)';
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
          relative w-80 h-96 mx-auto cursor-grab active:cursor-grabbing transition-all
          bg-gradient-to-br ${genderColor} ${genderColorDark}
          shadow-card hover:shadow-celebration border-0
          ${isAnimating ? 'duration-300 opacity-0' : isDragging ? 'duration-0' : 'duration-200'}
          ${className}
        `}
        style={{
          transform: getAnimationTransform(),
          opacity: isAnimating ? 0 : 1,
        }}
      >
        {/* Drag indicators */}
        <div 
          className="absolute top-8 left-8 px-4 py-2 rounded-lg bg-pass text-pass-foreground font-bold text-xl border-4 border-pass transition-opacity pointer-events-none"
          style={{ opacity: passOpacity, transform: 'rotate(-20deg)' }}
        >
          PASS
        </div>
        <div 
          className="absolute top-8 right-8 px-4 py-2 rounded-lg bg-like text-like-foreground font-bold text-xl border-4 border-like transition-opacity pointer-events-none"
          style={{ opacity: likeOpacity, transform: 'rotate(20deg)' }}
        >
          LIKE
        </div>

        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="mb-4">
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

          <h2 className="text-5xl font-bold mb-3 text-foreground leading-tight">
            {name.name}
          </h2>

          {name.origins && name.origins.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-4 max-w-[250px]">
              {name.origins.slice(0, 3).map((origin) => (
                <span 
                  key={origin} 
                  className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs capitalize"
                >
                  {origin}
                </span>
              ))}
            </div>
          )}

          {name.isCustom && (
            <div className="inline-flex px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
              ✨ Custom Addition
            </div>
          )}

          <div className="flex gap-3 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('pass'); }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-pass hover:bg-pass/80 text-pass-foreground transition-all duration-200 hover:scale-110 shadow-lg"
              disabled={isAnimating}
            >
              <X size={24} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('superlike'); }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-superlike hover:bg-superlike/80 text-superlike-foreground transition-all duration-200 hover:scale-110 shadow-lg"
              disabled={isAnimating}
            >
              <Star size={24} fill="currentColor" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('like'); }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-like hover:bg-like/80 text-like-foreground transition-all duration-200 hover:scale-110 shadow-lg"
              disabled={isAnimating}
            >
              <Heart size={24} fill="currentColor" />
            </button>
          </div>
        </div>
      </Card>

      {/* Swipe instruction */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        ← Swipe left to pass • Swipe right to like →
      </p>
    </div>
  );
};
