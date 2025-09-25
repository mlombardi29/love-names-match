import { Partner } from '@/hooks/useNameSwipe';
import { Button } from '@/components/ui/button';
import { Users, User } from 'lucide-react';

interface PartnerSelectorProps {
  currentPartner: Partner;
  onPartnerChange: (partner: Partner) => void;
  partner1Progress: { current: number; total: number; percentage: number };
  partner2Progress: { current: number; total: number; percentage: number };
}

export const PartnerSelector = ({ 
  currentPartner, 
  onPartnerChange, 
  partner1Progress, 
  partner2Progress 
}: PartnerSelectorProps) => {
  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users size={20} />
        <span className="text-sm font-medium">Choose who's swiping</span>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant={currentPartner === 'partner1' ? 'default' : 'secondary'}
          onClick={() => onPartnerChange('partner1')}
          className="flex flex-col items-center gap-2 h-auto p-4 min-w-[140px]"
        >
          <User size={24} />
          <div className="text-center">
            <div className="font-semibold">Partner 1</div>
            <div className="text-sm opacity-80">
              {partner1Progress.current} / {partner1Progress.total}
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
              <div 
                className="bg-white rounded-full h-1.5 transition-all duration-300" 
                style={{ width: `${partner1Progress.percentage}%` }}
              />
            </div>
          </div>
        </Button>
        
        <Button
          variant={currentPartner === 'partner2' ? 'default' : 'secondary'}
          onClick={() => onPartnerChange('partner2')}
          className="flex flex-col items-center gap-2 h-auto p-4 min-w-[140px]"
        >
          <User size={24} />
          <div className="text-center">
            <div className="font-semibold">Partner 2</div>
            <div className="text-sm opacity-80">
              {partner2Progress.current} / {partner2Progress.total}
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
              <div 
                className="bg-white rounded-full h-1.5 transition-all duration-300" 
                style={{ width: `${partner2Progress.percentage}%` }}
              />
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};