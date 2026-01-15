
import React, { useState, useEffect } from 'react';
import { FullContentData } from '../types';

interface FullContentViewProps {
  data: FullContentData | null;
  onShare: () => void;
}

const FullContentView: React.FC<FullContentViewProps> = ({ data, onShare }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data) return null;

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-background-dark animate-in fade-in duration-300">
      {/* Search Bar Placeholder */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="搜索订单编号或关键词..." 
            className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary/30"
            disabled
          />
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">list_alt</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">{data.title}</h2>
              <p className="text-[11px] text-slate-500 font-medium">共 {data.items.length} 条记录</p>
            </div>
          </div>
          <button 
            onClick={onShare}
            className="text-primary text-xs font-bold flex items-center gap-1 hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            分享
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {data.items.map((item, index) => (
              <div 
                key={item.id} 
                className="p-4 rounded-2xl border border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-2 hover:shadow-md hover:border-primary/20 transition-all group animate-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                    {item.subtitle}
                  </span>
                </div>
                <div className="flex items-start gap-2 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-slate-400 mt-0.5">info</span>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <button className="text-[11px] font-bold text-slate-400 group-hover:text-primary flex items-center gap-1 transition-colors">
                    查看详情 <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullContentView;
