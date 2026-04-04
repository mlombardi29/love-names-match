import { Heart, Plus, Sparkles, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentView: 'swipe' | 'matches' | 'add';
  onViewChange: (view: 'swipe' | 'matches' | 'add') => void;
  matchCount: number;
  displayName?: string;
  onSignOut?: () => void;
}

export const Navigation = ({ currentView, onViewChange, matchCount, displayName, onSignOut }: NavigationProps) => {
  const navItems = [
    { id: 'swipe' as const, label: 'Discover', icon: Search },
    { id: 'matches' as const, label: 'Matches', icon: Heart, badge: matchCount },
    { id: 'add' as const, label: 'Add', icon: Plus },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">BabyNames</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Find names together</p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex gap-1 p-1 bg-muted rounded-full">
            {navItems.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${currentView === id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* User info + Sign out */}
          <div className="flex items-center gap-3">
            {displayName && (
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                Hi, {displayName}
              </span>
            )}
            {onSignOut && (
              <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-1.5">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
