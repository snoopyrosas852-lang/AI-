
import React from 'react';
import { Message, Role } from '../types';

interface ChatViewProps {
  messages: Message[];
  isThinking: boolean;
  onSuggestion: (text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, isThinking, onSuggestion }) => {
  return (
    <div className="flex flex-col p-4 space-y-6 pb-24">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex items-start gap-3 ${msg.role === Role.USER ? 'justify-end' : ''}`}
        >
          {msg.role === Role.MODEL && (
            <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0 shadow-sm border border-primary/5">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>smart_toy</span>
            </div>
          )}
          
          <div className={`flex flex-col gap-1.5 ${msg.role === Role.USER ? 'items-end flex-1' : 'items-start flex-1'}`}>
            <p className="text-[#617589] dark:text-gray-400 text-[10px] font-medium px-1">
              {msg.role === Role.USER ? '我' : 'AI 助手'}
            </p>
            <div className={`
              text-[15px] leading-relaxed px-4 py-3 shadow-sm transition-all w-full
              ${msg.role === Role.USER 
                ? 'bg-primary text-white rounded-2xl rounded-tr-none max-w-[85%]' 
                : 'bg-white dark:bg-slate-800 text-[#111418] dark:text-slate-100 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700/50'
              }
            `}>
              {msg.isThinking ? (
                <div className="flex items-center gap-1 py-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              )}

              {/* Interactive Card Section */}
              {msg.interactiveData && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-inner">
                  <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">analytics</span>
                    {msg.interactiveData.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {msg.interactiveData.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onSuggestion(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95 flex items-center gap-1.5 border
                          ${opt.id.includes('view_all') 
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 w-full justify-center py-2.5' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-primary hover:bg-primary/5 hover:border-primary'
                          }
                        `}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {opt.id.includes('view_all') ? 'open_in_new' : 'add_circle'}
                        </span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    {msg.interactiveData.options.some(o => o.id.includes('view_all')) 
                      ? '点击上方卡片链接查看详情' 
                      : '点击项目名称快速发起查询'
                    }
                  </p>
                </div>
              )}
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div className="w-full mt-2">
                <details className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm" open>
                  <summary className="flex cursor-pointer items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-primary">link</span>
                      <p className="text-[#111418] dark:text-white text-[11px] font-semibold uppercase tracking-wider">参考来源 ({msg.sources.length})</p>
                    </div>
                    <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180 text-gray-400">expand_more</span>
                  </summary>
                  <div className="p-3 space-y-2 border-t border-gray-100 dark:border-gray-800">
                    {msg.sources.map((src, i) => (
                      <div key={src.id} className="flex items-start gap-2">
                        <span className="text-primary text-[11px] font-bold">[{i + 1}]</span>
                        <p className="text-[#617589] dark:text-gray-400 text-[12px] leading-snug underline cursor-pointer hover:text-primary transition-colors">{src.title}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>

          {msg.role === Role.USER && (
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-9 h-9 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600">
               <span className="material-symbols-outlined text-gray-500">person</span>
            </div>
          )}
        </div>
      ))}

      {isThinking && (
         <div className="flex items-start gap-3">
           <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
             <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>smart_toy</span>
           </div>
           <div className="flex flex-col gap-1.5 items-start">
              <p className="text-[#617589] dark:text-gray-400 text-[10px] font-medium ml-1">AI 助手</p>
              <div className="flex items-center gap-1 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default ChatView;
