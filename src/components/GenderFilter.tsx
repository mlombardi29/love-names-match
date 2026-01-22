import { Gender } from '@/data/names';

interface GenderFilterProps {
  selectedGender: Gender | 'all';
  onGenderChange: (gender: Gender | 'all') => void;
}

export const GenderFilter = ({ selectedGender, onGenderChange }: GenderFilterProps) => {
  const genderOptions: { value: Gender | 'all'; label: string; emoji: string }[] = [
    { value: 'all', label: 'All', emoji: '👶' },
    { value: 'girl', label: 'Girls', emoji: '👧' },
    { value: 'boy', label: 'Boys', emoji: '👦' },
    { value: 'unisex', label: 'Unisex', emoji: '✨' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-full">
      {genderOptions.map(({ value, label, emoji }) => (
        <button
          key={value}
          onClick={() => onGenderChange(value)}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200
            ${selectedGender === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <span>{emoji}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};
