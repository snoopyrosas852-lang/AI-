
import React from 'react';
import { DisplayMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  displayMode: DisplayMode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNewChat, displayMode }) => {
  const isDesktop = displayMode === DisplayMode.DESKTOP;
  
  const historyItems = [
    { id: '1', title: '关于人事政策的咨询', date: '2小时前' },
    { id: '2', title: '逾期订单查询', date: '昨天' },
    { id: '3', title: '智管中心扩容项目详情', date: '2024-03-20' },
    { id: '4', title: '新规程发布通知', date: '2024-03-15' },
  ];

  const sidebarBaseClass = isDesktop 
    ? `relative h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-all duration-300 ease-in-out ${isOpen ? 'w-[280px]' : 'w-0 overflow-hidden border-none'}`
    : `absolute top-0 left-0 h-full w-[300px] bg-white dark:bg-slate-900 z-50 shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;

  return (
    <>
      {!isDesktop && (
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />
      )}
      
      <aside className={sidebarBaseClass}>
        <div className="flex flex-col h-full w-[280px] lg:w-full">
          <div className="p-6 h-[73px] flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome_motion</span>
              <span className="tracking-tight">历史对话</span>
            </h2>
            {!isDesktop && (
              <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          <div className="p-4">
            <button 
              onClick={() => { onNewChat(); !isDesktop && onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              发起新对话
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2 custom-scrollbar">
            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">最近记录</p>
            {historyItems.map((item) => (
              <button 
                key={item.id}
                className="w-full flex flex-col gap-0.5 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-left transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[18px] group-hover:text-primary transition-colors">chat</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex-1">{item.title}</span>
                </div>
                <div className="flex items-center justify-between ml-8 mt-0.5">
                   <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">管理员</span>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Enterprise</span>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
