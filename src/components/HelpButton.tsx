import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpButtonProps {
  onClick: () => void;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300 hover:scale-110 group z-10"
      aria-label="ヘルプを表示"
    >
      <HelpCircle className="w-6 h-6 text-blue-500 group-hover:text-blue-600" />
    </button>
  );
};

export default HelpButton;