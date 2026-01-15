
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, AppView, AppMode, Source, InteractiveOption, FullContentData, FullContentItem, DisplayMode } from './types';
import { GeminiService } from './services/geminiService';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import FullContentView from './components/FullContentView';
import AdminLayout from './components/AdminLayout';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.USER);
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.DESKTOP);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fullContent, setFullContent] = useState<FullContentData | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  
  const geminiRef = useRef<GeminiService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!geminiRef.current) {
      geminiRef.current = new GeminiService();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, view]);

  const generateFullOrders = (): FullContentData => {
    const items: FullContentItem[] = [];
    const scenarios = ['原料短缺', '物流积压', '修改配送', '质检异常', '系统同步', '中转维护', '报关补充', '库区限制'];
    for (let i = 1; i <= 50; i++) {
      items.push({
        id: `ord-${10250+i}`,
        title: `ORD-${10250+i}`,
        subtitle: `逾期 ${Math.floor(Math.random() * 15) + 1} 天`,
        description: scenarios[i % scenarios.length] + "导致的发货延迟"
      });
    }
    return { title: "完整逾期订单数据库", items };
  };

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() || !geminiRef.current) return;

    if (messageText === 'view_full_orders_action') {
      const data = generateFullOrders();
      setFullContent(data);
      if (displayMode === DisplayMode.DESKTOP) {
        setIsRightPanelOpen(true);
      } else {
        setView(AppView.FULL_CONTENT);
      }
      return;
    }

    if (view !== AppView.CHAT) setView(AppView.CHAT);

    const userMessage: Message = { id: Date.now().toString(), role: Role.USER, text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      let currentResponse = '';
      const modelMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMessageId, role: Role.MODEL, text: '', isThinking: true }]);

      let actualPrompt = messageText;
      let interactiveData: { title: string; options: InteractiveOption[] } | undefined;

      if (messageText === '查询逾期订单') {
        actualPrompt = "列出10个逾期订单。格式：ORD-XXXXX | 描述 | 逾期X天。结尾引导点击查看完整50条。";
        interactiveData = {
          title: "实时库存异常明细 (部分):",
          options: [{ id: 'view_all', label: '查看完整50条明细', value: 'view_full_orders_action' }]
        };
      }

      await geminiRef.current.sendMessage(actualPrompt, (chunk) => {
        setIsThinking(false);
        currentResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, text: currentResponse, isThinking: false, interactiveData } : msg
        ));
      });

      if (messageText.includes('订单') || messageText.includes('项目')) {
         setMessages(prev => prev.map(msg => msg.id === modelMessageId ? {
           ...msg,
           sources: [{ id: 's1', title: '供应链大数据管理平台' }, { id: 's2', title: '仓储物流异常预警规则.pdf' }]
         } : msg));
      }
    } catch (error) {
       console.error(error);
       setIsThinking(false);
    }
  }, [inputText, view, displayMode]);

  const resetChat = () => {
    setMessages([]);
    setView(AppView.HOME);
    setFullContent(null);
    setIsRightPanelOpen(false);
    geminiRef.current = new GeminiService();
  };

  const isDesktop = displayMode === DisplayMode.DESKTOP;

  const renderModeSwitcher = () => (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-1.5 flex items-center gap-1 backdrop-blur-xl">
      <button 
        onClick={() => setAppMode(AppMode.USER)}
        className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${appMode === AppMode.USER ? 'bg-[#f1f4ff] text-[#5c5ce0]' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
        前台助手
      </button>
      <button 
        onClick={() => setAppMode(AppMode.ADMIN)}
        className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${appMode === AppMode.ADMIN ? 'bg-[#5c5ce0] text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
      >
        <span className="material-symbols-outlined text-[20px]">settings</span>
        管理后台
      </button>
    </div>
  );

  // User App Layout
  const renderUserLayout = () => (
    isDesktop ? (
      <div className="flex w-full h-screen bg-white dark:bg-slate-950 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onNewChat={resetChat} 
          displayMode={displayMode}
        />
        
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <Header 
            view={view} 
            displayMode={displayMode}
            onBack={() => setView(AppView.HOME)} 
            onClear={resetChat} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleDisplay={() => setDisplayMode(DisplayMode.MOBILE)}
          />
          
          <div className="flex flex-1 overflow-hidden relative">
            <main 
              ref={scrollRef}
              className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white dark:bg-slate-950 transition-all duration-300`}
            >
              <div className="max-w-[1000px] mx-auto w-full flex-1 flex flex-col px-6">
                {view === AppView.HOME ? (
                  <HomeView onPromptSelect={handleSendMessage} />
                ) : (
                  <ChatView messages={messages} isThinking={isThinking} onSuggestion={handleSendMessage} />
                )}
              </div>
              
              <div className="sticky bottom-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 p-6">
                <div className="max-w-[900px] mx-auto">
                  <MessageInput 
                    value={inputText}
                    onChange={setInputText}
                    onSend={() => handleSendMessage()}
                    isLoading={isThinking}
                    onReset={resetChat}
                    showReset={view === AppView.CHAT}
                  />
                </div>
              </div>
            </main>

            <aside className={`
              border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-all duration-500 overflow-hidden
              ${isRightPanelOpen ? 'w-[450px]' : 'w-0'}
            `}>
              <div className="w-[450px] h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    <span className="font-bold text-sm">关联明细视图</span>
                  </div>
                  <button onClick={() => setIsRightPanelOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FullContentView data={fullContent} onShare={() => {}} isEmbedded={true} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
        <div className="relative flex flex-col w-full max-w-[480px] h-[90vh] bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl overflow-hidden ring-8 ring-slate-800/5 dark:ring-white/5 border-[8px] border-slate-800 dark:border-slate-900">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onNewChat={resetChat} 
            displayMode={displayMode}
          />
          
          <Header 
            view={view} 
            displayMode={displayMode}
            onBack={() => setView(AppView.HOME)} 
            onClear={resetChat} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleDisplay={() => setDisplayMode(DisplayMode.DESKTOP)}
          />
          
          <main ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {view === AppView.HOME ? (
              <HomeView onPromptSelect={handleSendMessage} />
            ) : view === AppView.FULL_CONTENT ? (
              <FullContentView data={fullContent} onShare={() => setView(AppView.CHAT)} />
            ) : (
              <ChatView messages={messages} isThinking={isThinking} onSuggestion={handleSendMessage} />
            )}
          </main>

          <footer className={`p-4 bg-white/90 dark:bg-slate-950/90 border-t border-slate-100 dark:border-slate-800 ${view === AppView.FULL_CONTENT ? 'hidden' : 'block'}`}>
             <MessageInput 
                value={inputText}
                onChange={setInputText}
                onSend={() => handleSendMessage()}
                isLoading={isThinking}
                onReset={resetChat}
                showReset={view === AppView.CHAT}
              />
          </footer>
          
          <div className="h-6 w-full bg-white dark:bg-slate-950 flex justify-center items-start">
            <div className="w-24 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <>
      {appMode === AppMode.USER ? renderUserLayout() : <AdminLayout onClose={() => setAppMode(AppMode.USER)} />}
      {renderModeSwitcher()}
    </>
  );
};

export default App;
