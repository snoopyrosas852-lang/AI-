
import React, { useState } from 'react';
import { AdminStats, KnowledgeDoc, MaskingRule, GuidanceCommand } from '../types';

interface AdminLayoutProps {
  onClose: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'knowledge' | 'interaction' | 'security' | 'settings'>('security');

  const stats: AdminStats = {
    totalDocs: 124,
    totalQueries: 4820,
    accuracyRate: '94.2%',
    activeUsers: 85,
    intentDistribution: { direct: 72, clarify: 18, fail: 10 }
  };

  const [maskingRules, setMaskingRules] = useState<MaskingRule[]>([
    { id: '1', name: '手机号脱敏', pattern: '1[3-9]\\d{9}', replacement: '***********', isActive: true },
    { id: '2', name: '身份证号模糊', pattern: '\\d{18}', replacement: 'ID_MASKED', isActive: true },
    { id: '3', name: '价格信息敏感', pattern: '￥\\d+', replacement: '[PRICE]', isActive: false },
  ]);

  const [guidanceCommands, setGuidanceCommands] = useState<GuidanceCommand[]>([
    { id: '1', icon: 'assignment_late', label: '查询逾期订单', action: 'query_overdue' },
    { id: '2', icon: 'inventory_2', label: '库存明细检索', action: 'query_stock' },
    { id: '3', icon: 'update', label: '查看最近项目动态', action: 'query_projects' },
  ]);

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 overflow-hidden font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#5c5ce0] p-1.5 rounded-lg shadow-md shadow-indigo-500/20">
            <span className="material-symbols-outlined text-white text-[20px]">settings_suggest</span>
          </div>
          <span className="font-bold text-slate-800 dark:text-white tracking-tight">AI 运行管理中心</span>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${activeTab === 'dashboard' ? 'bg-[#f1f4ff] text-[#5c5ce0] dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            数据看板
          </button>
          
          <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">业务逻辑</div>
          
          <button 
            onClick={() => setActiveTab('interaction')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${activeTab === 'interaction' ? 'bg-[#f1f4ff] text-[#5c5ce0] dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined text-[20px]">account_tree</span>
            交互策略配置
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${activeTab === 'security' ? 'bg-[#f1f4ff] text-[#5c5ce0] dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined text-[20px]">shield</span>
            预处理/脱敏
          </button>

          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${activeTab === 'knowledge' ? 'bg-[#f1f4ff] text-[#5c5ce0] dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined text-[20px]">database</span>
            知识库管理
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${activeTab === 'settings' ? 'bg-[#f1f4ff] text-[#5c5ce0] dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            高级模型配置
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           <button 
            onClick={onClose}
            className="w-full flex items-center px-4 py-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-all text-[13px] font-medium"
           >
             <span className="material-symbols-outlined text-[18px] mr-2">logout</span>
             退出管理模式
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] dark:bg-slate-950 p-8 md:p-12">
        {activeTab === 'security' ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-start">
              <div>
                <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">预处理与安全脱敏</h1>
                <p className="text-slate-500 text-[14px] mt-1">配置用户输入前置过滤规则，保护企业隐私敏感数据</p>
              </div>
              <button className="bg-[#5c5ce0] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95">
                <span className="material-symbols-outlined text-[18px]">add</span>
                新建规则
              </button>
            </header>

            <div className="space-y-4">
               {maskingRules.map(rule => (
                 <div key={rule.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-[#5c5ce0]/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`size-2.5 rounded-full ${rule.isActive ? 'bg-[#4ade80]' : 'bg-slate-300'}`}></div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{rule.name}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 bg-[#f1f4ff] dark:bg-indigo-900/30 px-2 py-0.5 rounded text-[11px] font-medium">
                            <span className="text-slate-400">Regex:</span>
                            <span className="text-[#5c5ce0] font-mono">{rule.pattern}</span>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 text-[14px]">arrow_forward</span>
                          <div className="flex items-center gap-1 bg-[#ecfdf5] dark:bg-emerald-900/30 px-2 py-0.5 rounded text-[11px] font-medium">
                            <span className="text-slate-400">Replace:</span>
                            <span className="text-[#10b981] font-mono">{rule.replacement}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button 
                        onClick={() => setMaskingRules(prev => prev.map(r => r.id === rule.id ? {...r, isActive: !r.isActive} : r))}
                        className={`relative w-10 h-5 rounded-full transition-all duration-300 ${rule.isActive ? 'bg-[#5c5ce0]' : 'bg-slate-200 dark:bg-slate-700'}`}
                       >
                          <div className={`absolute top-1 size-3 bg-white rounded-full shadow-sm transition-all duration-300 ${rule.isActive ? 'right-1' : 'left-1'}`}></div>
                       </button>
                    </div>
                 </div>
               ))}
            </div>

            <div className="bg-[#ebf0ff] dark:bg-indigo-950/20 p-8 rounded-[1.5rem] border border-transparent">
               <div className="flex items-start gap-4">
                  <div className="bg-white/50 dark:bg-indigo-900/20 rounded-full p-1.5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#5c5ce0] text-[20px]">info</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#5c5ce0] dark:text-indigo-400 text-[15px] mb-2">规则处理顺序说明</h5>
                    <p className="text-[12px] text-[#5c5ce0]/70 dark:text-indigo-400/60 leading-relaxed max-w-3xl">
                      系统将按照规则列表从上至下依次进行正则匹配替换。建议将高频且基础的脱敏规则置于顶部。预处理完成后，干净的文本才会通过 API 发送至 Qwen 进行意图解析。
                    </p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
             <span className="material-symbols-outlined text-6xl opacity-20 mb-4">construction</span>
             <p className="text-sm font-medium">此模块正在开发中，请先查看“预处理/脱敏”页面</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
