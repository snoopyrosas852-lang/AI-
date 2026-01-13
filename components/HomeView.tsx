
import React from 'react';

interface HomeViewProps {
  onPromptSelect: (prompt: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onPromptSelect }) => {
  const suggestions = [
    { text: '查询逾期订单', icon: 'assignment_late' },
    { text: '项目商品查询', icon: 'inventory_2' },
    { text: '最近项目更新', icon: 'update' }
  ];

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col items-center justify-center px-6 py-12 flex-1">
        <div className="w-20 h-20 mb-6 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#0d141b] dark:text-slate-50">你好，我是您的 AI 知识助手</h2>
          <p className="text-sm text-[#4c739a] dark:text-slate-400 max-w-[280px]">
            我可以帮您快速查询商品，订单，项目考核。
          </p>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#4c739a] dark:text-slate-500">推荐指令</span>
          <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
        </div>
        <div className="flex flex-col gap-3">
          {suggestions.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => onPromptSelect(item.text)}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-primary/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary text-xl opacity-70">{item.icon}</span>
                 <span className="text-sm font-medium text-[#0d141b] dark:text-slate-200">{item.text}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-lg">arrow_forward_ios</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
