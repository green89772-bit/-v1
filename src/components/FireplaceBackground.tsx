import React from 'react';
import { AppTheme } from '../types';

interface Props {
  theme: AppTheme;
}

export const FireplaceBackground: React.FC<Props> = ({ theme }) => {
  if (theme === 'paper') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#fbf9f5] transition-colors duration-700">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#2c221e_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>
    );
  }

  if (theme === 'midnight') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#0d1520] transition-colors duration-700 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-950/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-slate-900/40 blur-[100px] rounded-full" />
      </div>
    );
  }

  // Fireplace amber default theme
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#120e0c] transition-colors duration-700 overflow-hidden">
      {/* Warm fireplace ambient lighting glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-amber-900/20 blur-[140px] rounded-full animate-pulse [animation-duration:6s]" />
      <div className="absolute -bottom-30 -left-20 w-[600px] h-[500px] bg-orange-950/25 blur-[120px] rounded-full" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-amber-950/15 blur-[130px] rounded-full" />

      {/* Floating hearth ember particles */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-amber-500/60 blur-[0.5px] animate-ping [animation-duration:4s]" />
        <div className="absolute top-[60%] left-[80%] w-2 h-2 rounded-full bg-orange-400/50 blur-[1px] animate-ping [animation-duration:5s]" />
        <div className="absolute top-[75%] left-[25%] w-1 h-1 rounded-full bg-amber-300/70 blur-[0.5px] animate-ping [animation-duration:3.5s]" />
      </div>
    </div>
  );
};
