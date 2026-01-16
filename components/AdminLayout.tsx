
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AdminStats, 
  IntentOverrideRule, 
  DataConnector, 
  AtomicIntent,
  IntentCategory,
  BadCase
} from '../types';

interface AdminLayoutProps {
  onClose: () => void;
}

type TabType = 'dashboard' | 'intent_override' | 'intent_dictionary' | 'intent_category' | 'datasource' | 'bad_cases';
type ModalType = 'none' | 'single' | 'batch';

const AdminLayout: React.FC<AdminLayoutProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showOverrideModal, setShowOverrideModal] = useState<ModalType>('none');
  const [showIntentModal, setShowIntentModal] = useState<ModalType>('none');
  const [showCategoryModal, setShowCategoryModal] = useState<ModalType>('none');
  
  const [editingIntent, setEditingIntent] = useState<AtomicIntent | null>(null);
  const [editingOverrideRule, setEditingOverrideRule] = useState<IntentOverrideRule | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // --- Mock Data ---
  const stats: AdminStats = {
    totalDocs: 124,
    totalQueries: 58240,
    accuracyRate: '92.8%',
    activeUsers: 452,
    directHitRate: 82.5,
    clarifyConvRate: 14.2,
    overrideRatio: 28.6,
    correctionRate: 4.8,
    outOfScopeRate: 6.2,
    avgLatency: 1.24,
    apiSuccessRate: 99.8,
    viewThroughRate: 42.1,
    intentDistribution: [
      { name: '查订单 (OMS)', count: 24500, percent: 42, color: 'bg-indigo-500' },
      { name: '查商品 (WMS)', count: 18200, percent: 31, color: 'bg-emerald-500' },
      { name: '人力资源查询', count: 8500, percent: 14, color: 'bg-sky-500' },
      { name: '财务报销', count: 4200, percent: 7, color: 'bg-amber-500' },
      { name: '未知/其他', count: 2840, percent: 6, color: 'bg-slate-400' },
    ]
  };

  const [categories, setCategories] = useState<IntentCategory[]>([
    { id: 'cat1', code: 'business', name: '业务逻辑 (Business)', color: 'indigo', description: '涉及业务流程流转及核心订单系统的交互逻辑' },
    { id: 'cat2', code: 'hr', name: '组织管理 (HR)', color: 'emerald', description: '人力资源相关的规章制度与员工关系维护指令' },
    { id: 'cat3', code: 'support', name: '运维支持 (Support)', color: 'amber', description: 'IT 故障申报、系统状态查询及运维协同场景' },
    { id: 'cat4', code: 'system', name: '核心系统 (System)', color: 'slate', description: '平台级的基础问候、状态检查及系统指令' },
  ]);

  const [intentRules, setIntentRules] = useState<IntentOverrideRule[]>([
    { id: '1', name: '强制查订单', keywords: ['我的订单', '查订单', '配送进度'], targetIntent: 'oms_order_query', parameters: '{"limit": 5, "status": "active"}', isActive: true },
    { id: '2', name: 'HR福利政策', keywords: ['年假', '体检', '保险'], targetIntent: 'hr_kb_query', parameters: '{"category": "benefits"}', isActive: true },
    { id: '3', name: '库存查询干预', keywords: ['余量', '库存', '还有货吗'], targetIntent: 'wms_stock_check', parameters: '{"detail": true}', isActive: true },
    { id: '4', name: '发票申请引导', keywords: ['开票', '电子发票', '补开发票'], targetIntent: 'oms_order_query', parameters: '{"mode": "invoice"}', isActive: false },
    { id: '5', name: '系统维护通告', keywords: ['打不开', '白屏', '报错'], targetIntent: 'support_system_check', parameters: '{"scope": "all"}', isActive: true },
    { id: '6', name: '员工宿舍申请', keywords: ['住宿', '申请宿舍', '宿舍管理'], targetIntent: 'hr_kb_query', parameters: '{"form": "dorm"}', isActive: true },
    { id: '7', name: '加班餐费标准', keywords: ['加班费', '餐补', '加班餐'], targetIntent: 'hr_kb_query', parameters: '{"policy": "overtime_meal"}', isActive: true },
    { id: '8', name: '年终奖金查询', keywords: ['年终奖', '13薪', '年终绩效'], targetIntent: 'hr_kb_query', parameters: '{"secret": "level_2"}', isActive: false },
    { id: '9', name: '物料领用申请', keywords: ['领文具', '领电脑', '申领'], targetIntent: 'business_asset_apply', parameters: '{"dept_required": true}', isActive: true },
    { id: '10', name: '差旅报销助手', keywords: ['报销', '差旅费', '出差报销'], targetIntent: 'business_finance_reimburse', parameters: '{"guide": true}', isActive: true },
  ]);

  const [atomicIntents, setAtomicIntents] = useState<AtomicIntent[]>([
    { id: 'ai1', code: 'oms_order_query', name: '查订单', description: '调用 OMS 接口查询用户关联的订单列表及状态', category: 'business' },
    { id: 'ai2', code: 'hr_kb_query', name: '查商品', description: '基于 RAG 的人力资源政策法规深度检索', category: 'hr' },
    { id: 'ai3', code: 'wms_stock_check', name: '查资料', description: '穿透 WMS 系统查询特定 SKU 的物理仓位与可用量', category: 'business' },
    { id: 'ai4', code: 'support_system_check', name: '系统检查', description: '检查核心业务系统的实时运行健康状态', category: 'support' },
    { id: 'ai5', code: 'business_asset_apply', name: '资产申领', description: '发起企业内部资产申领工作流', category: 'business' },
    { id: 'ai6', code: 'business_finance_reimburse', name: '财务报销', description: '启动财务报销辅助助手及表单引导', category: 'business' },
  ]);

  const [badCases] = useState<BadCase[]>([
    { id: 'bc1', query: '我的订单到哪了', aiResponse: '请问您的订单号是多少？', correction: '上下文已有单号 ORD-10251，应直接查询。', timestamp: '2024-05-20 14:22' },
    { id: 'bc2', query: '我想申请退货', aiResponse: '好的，请问退货原因是什么？', correction: '意图识别为 HR_POLICY，应为 OMS_RETURN。', timestamp: '2024-05-20 15:01' },
    { id: 'bc3', query: '餐补标准是多少', aiResponse: '抱歉，我不清楚您的部门。', correction: 'RAG 检索未命中，应召回《员工通用手册》。', timestamp: '2024-05-20 16:45' },
    { id: 'bc4', query: '开票抬头是什么', aiResponse: '公司的开票抬头是：XX科技有限公司', correction: '回答正确但建议增加纳税人识别号。', timestamp: '2024-05-21 09:10' },
    { id: 'bc5', query: '项目进度怎么看', aiResponse: '请点击导航栏的项目管理。', correction: '应调用项目接口返回当前参与项目的卡片。', timestamp: '2024-05-21 11:30' },
    { id: 'bc6', query: '怎么查公积金', aiResponse: '请登录社保官网。', correction: '由于接入了 HR 系统，应引导用户进行意图澄清。', timestamp: '2024-05-21 13:05' },
  ]);

  const [connectors] = useState<DataConnector[]>([
    { id: 'c1', name: 'OMS 订单中心', baseUrl: 'https://api.oms.corp.com/v1', authType: 'token', mapping: { titleField: 'order_no', subtitleField: 'delivery_eta', statusField: 'state' } },
  ]);

  const filteredRules = useMemo(() => {
    return intentRules.filter(rule => 
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rule.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rule.targetIntent.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [intentRules, searchQuery]);

  const totalPages = Math.ceil(filteredRules.length / pageSize);
  const paginatedRules = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRules.slice(start, start + pageSize);
  }, [filteredRules, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAddOverrideRule = (newRule: IntentOverrideRule) => {
    setIntentRules(prev => [newRule, ...prev]);
    setShowOverrideModal('none');
  };

  const handleUpdateOverrideRule = (updatedRule: IntentOverrideRule) => {
    setIntentRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    setEditingOverrideRule(null);
    setShowOverrideModal('none');
  };

  const handleDeleteOverrideRule = (id: string) => {
    if (confirm('确定要删除此意图干预规则吗？')) {
      setIntentRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleToggleRuleStatus = (id: string) => {
    setIntentRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleBatchAddOverride = (rules: IntentOverrideRule[]) => {
    setIntentRules(prev => [...rules, ...prev]);
    setShowOverrideModal('none');
  };

  const handleAddIntent = (newIntent: AtomicIntent) => {
    setAtomicIntents(prev => [...prev, newIntent]);
    setShowIntentModal('none');
  };

  const handleUpdateIntent = (updatedIntent: AtomicIntent) => {
    setAtomicIntents(prev => prev.map(it => it.id === updatedIntent.id ? updatedIntent : it));
    setEditingIntent(null);
    setShowIntentModal('none');
  };

  const handleDeleteIntent = (id: string) => {
    if (confirm('确定要删除该原子意图吗？这将影响关联的干预规则。')) {
      setAtomicIntents(prev => prev.filter(it => it.id !== id));
    }
  };

  const handleBatchAddIntents = (intents: AtomicIntent[]) => {
    setAtomicIntents(prev => [...prev, ...intents]);
    setShowIntentModal('none');
  };

  const handleAddCategory = (newCat: IntentCategory) => {
    setCategories(prev => [...prev, newCat]);
    setShowCategoryModal('none');
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* 1. 核心效能指标 (Core Performance) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">rocket_launch</span>
            核心效能看板
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">REALTIME UPDATE</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: '意图直接命中率', value: `${stats.directHitRate}%`, icon: 'bolt', color: 'text-amber-500', bg: 'bg-amber-50', desc: '置信度>0.9或强匹配规则命中' },
            { label: '平均响应耗时', value: `${stats.avgLatency}s`, icon: 'timer', color: 'text-indigo-500', bg: 'bg-indigo-50', desc: '端到端 API 链路延迟' },
            { label: '澄清转化率', value: `${stats.clarifyConvRate}%`, icon: 'call_split', color: 'text-emerald-500', bg: 'bg-emerald-50', desc: '澄清引导卡片点击成交率' },
            { label: '详情穿透率', value: `${stats.viewThroughRate}%`, icon: 'visibility', color: 'text-sky-500', bg: 'bg-sky-50', desc: '摘要到明细视图的转化' },
          ].map((card, i) => (
            <div key={i} className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`size-12 ${card.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <span className={`material-symbols-outlined text-[28px] ${card.color}`}>{card.icon}</span>
                </div>
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{card.value}</div>
              <div className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mt-1">{card.label}</div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium leading-tight">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. 意图识别质量 (Intent Quality) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-10 flex flex-col shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500">troubleshoot</span>
              模型识别质量
            </h3>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 active:scale-95"
              onClick={() => setActiveTab('bad_cases')}
            >
              <span className="material-symbols-outlined text-[16px]">bug_report</span>
              查看坏案例 (BadCases)
            </button>
          </div>
          
          <div className="max-w-2xl">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">修正性输入率 (Correction Rate)</span>
                  <span className="text-sm font-black text-rose-500">{stats.correctionRate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${stats.correctionRate * 5}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">1分钟内重复或修正提问的频率</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">人工干预占比 (Override Ratio)</span>
                  <span className="text-sm font-black text-indigo-500">{stats.overrideRatio}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.overrideRatio}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">命中规则库强匹配指令的比例</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">意图越界率 (Out-of-Scope)</span>
                  <span className="text-sm font-black text-amber-500">{stats.outOfScopeRate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.outOfScopeRate * 4}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">识别为 Unknown Intent 的比例</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 意图分布 (Intent Distribution) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-10 flex flex-col shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-sky-500">pie_chart</span>
            高频意图排行
          </h3>
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {stats.intentDistribution.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[12px] font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className="text-slate-400">{item.percent}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono w-10 text-right">{(item.count / 1000).toFixed(1)}k</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
             <button 
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100/50 dark:border-indigo-800/50 shadow-sm active:scale-95"
              onClick={() => alert('报告生成中，请稍候...')}
             >
               <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
               下载完整报告 (PDF)
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBadCases = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bad Case 案例集</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">汇总模型识别错误或回答不佳的真实对话案例，用于针对性迭代规则库与 Prompt。</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">upload_file</span>导出案例
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">案例 ID</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">用户提问</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">AI 回答</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">优化意见 / Correction</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">发生时间</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {badCases.map((bc) => (
                <tr key={bc.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <td className="px-8 py-5">
                    <span className="text-[11px] font-mono font-bold text-slate-400">{bc.id}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[13px] font-bold text-slate-800 dark:text-white max-w-[200px] truncate">{bc.query}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-[200px] line-clamp-2">{bc.aiResponse}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-start gap-2 max-w-[240px]">
                      <span className="material-symbols-outlined text-rose-500 text-[16px] mt-0.5">error_outline</span>
                      <p className="text-[12px] font-medium text-rose-600 dark:text-rose-400">{bc.correction}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[11px] font-bold text-slate-400">{bc.timestamp}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-indigo-600 text-[11px] font-black uppercase tracking-widest hover:underline">去处理</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOverrideModal = () => {
    if (showOverrideModal === 'none') return null;
    const isEditing = !!editingOverrideRule;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowOverrideModal('none'); setEditingOverrideRule(null); }}></div>
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/10">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{isEditing ? '修改干预规则' : '新增意图匹配规则'}</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">手动干预模型意图识别，提升核心业务流程的确定性。</p>
            </div>
          </div>
          <div className="p-10">
            {showOverrideModal === 'single' ? (
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const ruleData = {
                  id: isEditing ? editingOverrideRule.id : Date.now().toString(),
                  name: formData.get('name') as string,
                  keywords: (formData.get('keywords') as string).split(',').map(k => k.trim()),
                  targetIntent: formData.get('targetIntent') as string,
                  parameters: formData.get('parameters') as string || '{}',
                  isActive: isEditing ? editingOverrideRule.isActive : true
                };
                if (isEditing) handleUpdateOverrideRule(ruleData);
                else handleAddOverrideRule(ruleData);
              }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">规则名称</label>
                    <input name="name" required defaultValue={editingOverrideRule?.name || ''} placeholder="例如：强制进入售后流程" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">目标原子意图</label>
                    <select name="targetIntent" defaultValue={editingOverrideRule?.targetIntent || ''} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm">
                      {atomicIntents.map(ai => <option key={ai.id} value={ai.code}>{ai.name} ({ai.code})</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">触发关键词 (逗号分隔)</label>
                  <input name="keywords" required defaultValue={editingOverrideRule?.keywords.join(', ') || ''} placeholder="退货, 换货" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">槽位预填参数 (JSON)</label>
                  <textarea name="parameters" rows={3} defaultValue={editingOverrideRule?.parameters || '{}'} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-mono" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => { setShowOverrideModal('none'); setEditingOverrideRule(null); }} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 transition-colors">取消</button>
                  <button type="submit" className="px-8 py-3 rounded-xl text-sm font-bold bg-[#5c5ce0] text-white">
                    {isEditing ? '保存修改' : '确认并保存'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">批量导入规则 (JSON 列表)</label>
                  <textarea rows={8} id="batch-override-json" placeholder='[{"name": "规则名", "keywords": ["关键词1", "关键词2"], "targetIntent": "code", "parameters": "{}"}]' className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-mono" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowOverrideModal('none')} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">取消</button>
                  <button onClick={() => {
                    try {
                      const val = (document.getElementById('batch-override-json') as HTMLTextAreaElement).value;
                      handleBatchAddOverride(JSON.parse(val).map((p: any) => ({ ...p, id: Math.random().toString(), isActive: true })));
                    } catch(e) { alert('JSON 格式错误'); }
                  }} className="px-8 py-3 rounded-xl text-sm font-bold bg-[#5c5ce0] text-white">开始导入</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderIntentModal = () => {
    if (showIntentModal === 'none') return null;
    const isEditing = !!editingIntent;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowIntentModal('none'); setEditingIntent(null); }}></div>
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{isEditing ? '编辑原子意图' : '注册新原子意图'}</h3>
              <p className="text-sm text-slate-500 mt-1">定义系统的原子指令集，它是平台智能化能力的基础单元。</p>
            </div>
          </div>
          <div className="p-10">
            {showIntentModal === 'single' ? (
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const intentData = {
                  id: isEditing ? editingIntent.id : Date.now().toString(),
                  code: formData.get('code') as string,
                  name: formData.get('name') as string,
                  category: formData.get('category') as string,
                  description: formData.get('description') as string
                };
                if (isEditing) handleUpdateIntent(intentData);
                else handleAddIntent(intentData);
              }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">意图代码 (CODE)</label>
                    <input name="code" required defaultValue={editingIntent?.code || ''} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分类</label>
                    <select name="category" defaultValue={editingIntent?.category || 'business'} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm">
                      {categories.map(cat => <option key={cat.id} value={cat.code}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">展示名称</label>
                  <input name="name" required defaultValue={editingIntent?.name || ''} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">核心描述</label>
                  <textarea name="description" rows={3} defaultValue={editingIntent?.description || ''} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => { setShowIntentModal('none'); setEditingIntent(null); }} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500">取消</button>
                  <button type="submit" className="px-8 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white">
                    {isEditing ? '保存修改' : '完成注册'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <textarea rows={8} id="batch-intent-json" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-mono" />
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowIntentModal('none')} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500">取消</button>
                  <button onClick={() => {
                    try {
                      const val = (document.getElementById('batch-intent-json') as HTMLTextAreaElement).value;
                      handleBatchAddIntents(JSON.parse(val).map((p: any) => ({ ...p, id: Math.random().toString() })));
                    } catch(e) { alert('JSON 格式错误'); }
                  }} className="px-8 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white">开始导入</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryModal = () => {
    if (showCategoryModal === 'none') return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCategoryModal('none')}></div>
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/10">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">新增意图分类</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">定义意图的所属领域，便于在大规模指令集中进行检索与权限控制。</p>
            </div>
          </div>
          <div className="p-10">
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddCategory({
                id: Date.now().toString(),
                code: formData.get('code') as string,
                name: formData.get('name') as string,
                color: formData.get('color') as string,
                description: formData.get('description') as string
              });
            }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分类代码 (CODE)</label>
                  <input name="code" required placeholder="例如：oms_core" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">展示名称</label>
                  <input name="name" required placeholder="例如：订单中心逻辑" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCategoryModal('none')} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500">取消</button>
                <button type="submit" className="px-8 py-3 rounded-xl text-sm font-bold bg-[#5c5ce0] text-white shadow-lg">保存分类</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderIntentOverride = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">意图干预引擎</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">配置关键词强匹配规则，使特定指令绕过 AI 预测直接执行动作。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-indigo-500 transition-colors">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索规则名称、关键词..."
              className="pl-10 pr-4 py-2.5 w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => { setEditingOverrideRule(null); setShowOverrideModal('single'); }} 
            className="bg-[#5c5ce0] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">add</span>新增规则
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">状态</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">规则名称</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">触发关键词</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">目标意图</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">预填参数 (JSON)</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-right">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRules.length > 0 ? (
                paginatedRules.map((rule) => (
                  <tr key={rule.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all duration-300">
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => handleToggleRuleStatus(rule.id)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                        ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rule.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white text-[15px] tracking-tight">{rule.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {rule.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {rule.keywords.map((kw, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-md border border-indigo-100/50 dark:border-indigo-900/10">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-300 font-mono text-[12px] font-bold">
                        <span className="material-symbols-outlined text-[16px]">integration_instructions</span>
                        {rule.targetIntent}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative group/code max-w-[180px]">
                        <code className="block px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono rounded-lg truncate border border-slate-100 dark:border-slate-700">
                          {rule.parameters}
                        </code>
                        <div className="absolute left-0 top-full mt-1 hidden group-hover/code:block z-20 bg-slate-900 text-emerald-400 p-3 rounded-lg shadow-xl text-[10px] font-mono whitespace-pre max-w-[300px] border border-slate-700">
                          {rule.parameters}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingOverrideRule(rule); setShowOverrideModal('single'); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200 transition-all shadow-sm"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                         <button onClick={() => handleDeleteOverrideRule(rule.id)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 border border-transparent hover:border-slate-200 transition-all shadow-sm"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <span className="material-symbols-outlined text-4xl text-slate-200">search_off</span>
                       <p className="text-slate-400 text-sm font-medium">未找到匹配的干预规则</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            显示 {filteredRules.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredRules.length)} / 共 {filteredRules.length} 条规则
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center justify-center size-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-indigo-500 hover:text-indigo-500 shadow-sm'}`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`flex items-center justify-center size-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all ${(currentPage === totalPages || totalPages === 0) ? 'opacity-30 cursor-not-allowed' : 'hover:border-indigo-500 hover:text-indigo-500 shadow-sm'}`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntentDictionary = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">原子意图管理</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">定义和管理系统中所有支持的原子指令集，作为意图干预和多轮对话的基础。</p>
        </div>
        <button onClick={() => { setEditingIntent(null); setShowIntentModal('single'); }} className="bg-[#10b981] hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95">
          <span className="material-symbols-outlined text-lg">add_circle</span>注册新意图
        </button>
      </header>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                <th className="px-10 py-6">意图代码 (CODE)</th>
                <th className="px-10 py-6 text-base">意图名称</th>
                <th className="px-10 py-6">分类</th>
                <th className="px-10 py-6">功能描述</th>
                <th className="px-10 py-6 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {atomicIntents.map(intent => {
                const cat = categories.find(c => c.code === intent.category);
                return (
                  <tr key={intent.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-10 py-6"><code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">{intent.code}</code></td>
                    <td className="px-10 py-6 font-bold text-slate-800 dark:text-slate-200 text-lg tracking-tight">{intent.name}</td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${cat?.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : cat?.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : cat?.color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>{cat?.code.toUpperCase() || intent.category}</span>
                    </td>
                    <td className="px-10 py-6 text-sm text-slate-500 max-w-sm truncate font-medium">{intent.description}</td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => { setEditingIntent(intent); setShowIntentModal('single'); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200 transition-all shadow-sm"><span className="material-symbols-outlined text-[18px]">edit_note</span></button>
                         <button onClick={() => handleDeleteIntent(intent.id)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 border border-transparent hover:border-slate-200 transition-all shadow-sm"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderIntentCategory = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">意图分类管理</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">统一管理系统内的意图归类及其元数据。</p>
        </div>
        <button onClick={() => setShowCategoryModal('single')} className="bg-[#5c5ce0] hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"><span className="material-symbols-outlined text-lg">category</span>注册新分类</button>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                 <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm ${cat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : cat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : cat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}><span className="material-symbols-outlined text-[28px]">label</span></div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-2xl tracking-tight">{cat.name}</h4>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg"><code className="text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400">{cat.code}</code></div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium min-h-[48px] line-clamp-2">{cat.description}</p>
            <div className="mt-4 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2 text-slate-400 text-xs font-bold"><span className="material-symbols-outlined text-sm">link</span><span>关联原子意图: {atomicIntents.filter(i => i.category === cat.code).length} 条</span></div>
               <button className="text-[#5c5ce0] text-xs font-black hover:underline tracking-tighter">管理规则</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataSources = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">卡片管理器</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium tracking-tight">配置卡片式交互的数据映射逻辑。</p>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {connectors.map(conn => (
          <div key={conn.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm border-l-[10px] border-l-[#5c5ce0] p-10 flex flex-col gap-8">
            <h4 className="font-bold text-slate-900 dark:text-white text-2xl tracking-tight">{conn.name}</h4>
            <div className="grid grid-cols-3 gap-5">
               {['标题', '描述', '状态'].map((label, i) => (
                 <div key={i} className="flex flex-col gap-3 p-5 bg-[#f1f4ff] dark:bg-slate-800 rounded-2xl border border-indigo-50/50 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] text-[#5c5ce0] dark:text-indigo-400 font-black uppercase tracking-widest">{label}</span>
                    <span className="text-xs font-mono text-[#5c5ce0] dark:text-indigo-300 font-bold bg-white/60 dark:bg-black/20 px-2 py-1 rounded truncate">mapping_field</span>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 overflow-hidden font-display relative">
      {renderOverrideModal()}
      {renderIntentModal()}
      {renderCategoryModal()}
      
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-30">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-[#5c5ce0] p-2.5 rounded-2xl shadow-xl shadow-indigo-600/20"><span className="material-symbols-outlined text-white text-[28px]">settings_suggest</span></div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-white text-lg leading-none tracking-tighter">AI 管理中心</span>
            <span className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">Enterprise v3.5</span>
          </div>
        </div>
        
        <nav className="flex-1 px-5 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><span className="material-symbols-outlined text-[24px]">dashboard</span>运营看板</button>
          <div className="pt-8 pb-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">意图管理</div>
          {[
            { id: 'intent_override', label: '意图干预引擎', icon: 'auto_fix_high' },
            { id: 'intent_dictionary', label: '原子意图管理', icon: 'book_5' },
            { id: 'intent_category', label: '意图分类管理', icon: 'category' },
            { id: 'datasource', label: '卡片管理器', icon: 'hub' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><span className="material-symbols-outlined text-[24px]">{tab.icon}</span>{tab.label}</button>
          ))}
          <div className="pt-8 pb-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">平台治理</div>
          <button onClick={() => setActiveTab('bad_cases')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'bad_cases' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><span className="material-symbols-outlined text-[24px]">assignment_late</span>Bad Case 案例集</button>
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
           <button onClick={onClose} className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all text-sm font-bold group"><span className="material-symbols-outlined text-[22px] group-hover:rotate-180 transition-transform">logout</span>返回前台助手</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-10 flex items-center justify-between z-20">
          <div className="flex items-center gap-3"><span className="px-2.5 py-1 bg-[#5c5ce0] text-white text-[10px] font-black rounded uppercase tracking-[0.1em]">ADMIN</span><span className="text-slate-300">/</span><span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tighter">
            {activeTab === 'dashboard' && '运营看板'}
            {activeTab === 'intent_override' && '意图干预引擎'}
            {activeTab === 'intent_dictionary' && '原子意图管理'}
            {activeTab === 'intent_category' && '意图分类管理'}
            {activeTab === 'datasource' && '卡片管理器'}
            {activeTab === 'bad_cases' && 'Bad Case 案例集'}
          </span></div>
          <div className="flex items-center gap-6"><div className="text-right hidden sm:block"><p className="text-sm font-black text-slate-900 dark:text-white leading-none">咸亨管理员</p><p className="text-[10px] text-slate-400 mt-1 font-bold tracking-tighter uppercase">Super Admin Role</p></div><div className="size-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-slate-500 text-2xl">account_circle</span></div></div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] dark:bg-slate-950 p-10 md:p-14">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'intent_override' && renderIntentOverride()}
          {activeTab === 'intent_dictionary' && renderIntentDictionary()}
          {activeTab === 'intent_category' && renderIntentCategory()}
          {activeTab === 'datasource' && renderDataSources()}
          {activeTab === 'bad_cases' && renderBadCases()}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
