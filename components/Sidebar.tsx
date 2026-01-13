
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNewChat }) => {
  const historyItems = [
    { id: '1', title: '关于人事政策的咨询', date: '2小时前' },
    { id: '2', title: '逾期订单查询', date: '昨天' },
    { id: '3', title: '智管中心扩容项目详情', date: '2024-03-20' },
    { id: '4', title: 'LLM 知识库接入规范', date: '2024-03-18' },
  ];

  return (
    <>
      {/* Overlay: Now absolute to stay within the parent container */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Content: Now absolute to stay within the parent container */}
      <aside 
        className={`absolute top-0 left-0 h-full w-[280px] bg-white dark:bg-slate-900 z-50 shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              历史对话
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button 
              onClick={() => { onNewChat(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              新对话
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1 py-2 custom-scrollbar">
            {historyItems.map((item) => (
              <button 
                key={item.id}
                className="w-full flex flex-col gap-1 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-primary transition-colors">chat_bubble</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex-1">{item.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 ml-8 font-medium">{item.date}</span>
              </button>
            ))}
          </div>

          {/* Footer / User Profile */}
          <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600 overflow-hidden">
                <span className="material-symbols-outlined text-slate-500">person</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">知识助手用户</span>
                <span className="text-[11px] text-slate-500 font-medium truncate">企业版・标准权限</span>
              </div>
              <button className="ml-auto p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
