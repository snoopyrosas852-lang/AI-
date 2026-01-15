
import React from 'react';
import { AppView, DisplayMode } from '../types';

interface HeaderProps {
  view: AppView;
  displayMode: DisplayMode;
  onBack: () => void;
  onClear: () => void;
  onMenuClick: () => void;
  onToggleDisplay: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, displayMode, onBack, onClear, onMenuClick, onToggleDisplay }) => {
  const isDesktop = displayMode === DisplayMode.DESKTOP;
  
  return (
    <header className={`
      flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 h-[73px]
    `}>
      <div className="flex items-center gap-4">
        {(!isDesktop && (view === AppView.CHAT || view === AppView.FULL_CONTENT)) ? (
          <button onClick={onBack} className="text-slate-800 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
        ) : (
          <button onClick={onMenuClick} className="text-slate-800 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
            <span className="material-symbols-outlined">{isDesktop && !isDesktop ? 'menu' : 'menu_open'}</span>
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-slate-50 text-base font-bold tracking-tight">
            {isDesktop ? '智能企业知识库助手' : (view === AppView.HOME ? '知识库' : '对话中')}
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-green-600 dark:text-green-500 font-bold uppercase tracking-widest">AI Engine Active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleDisplay}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all text-xs font-bold border border-transparent hover:border-primary/20"
        >
          <span className="material-symbols-outlined text-[18px]">{isDesktop ? 'smartphone' : 'desktop_windows'}</span>
          <span className="hidden sm:inline">{isDesktop ? '切换移动端' : '切换 PC 端'}</span>
        </button>
        
        {view === AppView.CHAT && (
          <button 
            onClick={onClear} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            <span className="hidden md:inline">清空会话</span>
          </button>
        )}
        
        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
