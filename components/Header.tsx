
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  view: AppView;
  onBack: () => void;
  onClear: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, onBack, onClear, onMenuClick }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark sticky top-0 z-20">
      <div className="size-10 flex items-center justify-start">
        {(view === AppView.CHAT || view === AppView.FULL_CONTENT) ? (
          <button onClick={onBack} className="text-[#0d141b] dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded-full transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
        ) : (
          <button onClick={onMenuClick} className="text-[#0d141b] dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[#0d141b] dark:text-slate-50">menu</span>
          </button>
        )}
      </div>
      
      <div className="flex flex-col items-center max-w-[240px]">
        <h1 className="text-[#0d141b] dark:text-slate-50 text-base font-semibold tracking-tight truncate w-full text-center">
          {view === AppView.HOME ? '知识助手' : view === AppView.CHAT ? 'AI 知识助手' : '明细列表'}
        </h1>
        {view === AppView.CHAT && (
          <span className="text-[10px] text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            在线
          </span>
        )}
      </div>

      <div className="size-10 flex items-center justify-end gap-1">
        {(view === AppView.CHAT || view === AppView.FULL_CONTENT) ? (
          <>
            {view === AppView.CHAT && (
              <button onClick={onClear} className="text-[#0d141b] dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded-full transition-colors" title="清空对话">
                <span className="material-symbols-outlined text-[22px]">delete_sweep</span>
              </button>
            )}
            <span className="material-symbols-outlined text-[#0d141b] dark:text-slate-50">more_horiz</span>
          </>
        ) : (
          <div className="size-10"></div>
        )}
      </div>
    </header>
  );
};

export default Header;
