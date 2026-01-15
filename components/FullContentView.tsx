
import React, { useState, useEffect } from 'react';
import { FullContentData } from '../types';

interface FullContentViewProps {
  data: FullContentData | null;
  onShare: () => void;
  isEmbedded?: boolean;
}

const FullContentView: React.FC<FullContentViewProps> = ({ data, onShare, isEmbedded }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
       <span className="material-symbols-outlined text-6xl opacity-20 mb-4">analytics</span>
       <p className="text-sm">尚未加载明细数据，请在对话中点击相应指令发起查询</p>
    </div>
  );

  return (
    <div className={`flex flex-col min-h-full animate-in fade-in duration-300 ${isEmbedded ? 'bg-transparent' : 'bg-slate-50 dark:bg-background-dark'}`}>
      <div className={`sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 border-b border-slate-100 dark:border-slate-800`}>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input 
            type="text" 
            placeholder="搜索关键词..." 
            className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{data.title}</h2>
              <p className="text-[10px] text-slate-500 font-medium">共 {data.items.length} 条记录</p>
            </div>
          </div>
          {!isEmbedded && (
            <button 
              onClick={onShare}
              className="text-primary text-[10px] font-bold flex items-center gap-1 hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">share</span>
              返回并分享
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {data.items.map((item, index) => (
              <div 
                key={item.id} 
                className="p-3 rounded-xl border border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-1.5 hover:shadow-md hover:border-primary/30 transition-all group animate-in slide-in-from-right-4"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{item.title}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                    {item.subtitle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullContentView;
