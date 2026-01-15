
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, AppView, Source, InteractiveOption, FullContentData, FullContentItem } from './types';
import { GeminiService } from './services/geminiService';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import FullContentView from './components/FullContentView';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fullContent, setFullContent] = useState<FullContentData | null>(null);
  
  const geminiRef = useRef<GeminiService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!geminiRef.current) {
      geminiRef.current = new GeminiService();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current && view === AppView.CHAT) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, view]);

  const generateFullOrders = (): FullContentData => {
    const items: FullContentItem[] = [];
    const scenarios = [
      '原料供应短缺导致生产延迟', 
      '节假日物流高峰积压', 
      '应客户要求更改配送时间', 
      '质检环节异常复检', 
      '系统订单同步异常需人工核对',
      '物流中转中心临时维护',
      '海关报关单据需补充材料',
      '库区盘点造成临时发货受限'
    ];
    
    for (let i = 1; i <= 50; i++) {
      const ordNum = 10250 + i;
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      const days = Math.floor(Math.random() * 15) + 1;
      items.push({
        id: `ord-${ordNum}`,
        title: `ORD-${ordNum}`,
        subtitle: `逾期 ${days} 天`,
        description: scenario
      });
    }
    
    return {
      title: "完整逾期订单明细表 (50条)",
      items
    };
  };

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() || !geminiRef.current) return;

    // INTERCEPT: If it's the special action button, jump to view instead of sending chat
    if (messageText === 'view_full_orders_action') {
      const data = generateFullOrders();
      setFullContent(data);
      setView(AppView.FULL_CONTENT);
      return;
    }

    if (view === AppView.HOME || view === AppView.FULL_CONTENT) {
      setView(AppView.CHAT);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      let currentResponse = '';
      const modelMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: Role.MODEL,
        text: '',
        isThinking: true
      }]);

      let actualPrompt = messageText;
      let interactiveData: { title: string; options: InteractiveOption[] } | undefined;

      if (messageText === '查询逾期订单') {
        actualPrompt = "请帮我列出10条模拟的逾期订单明细。格式严格要求如下：1. **ORD-XXXXX** | 场景描述 | 逾期X天。请只列出10条。最后附上一句：'点击下方卡片可查看完整50条明细。'";
        interactiveData = {
          title: "查询结果已简化展示（前10条）:",
          options: [
            { id: 'view_all_orders', label: '查看完整内容 (余下40条)', value: 'view_full_orders_action' }
          ]
        };
      } else if (messageText === '项目商品查询') {
        actualPrompt = "我想查询具体的项目商品信息。请作为一个专业的企业助手，引导我告诉我需要查询哪一个具体的项目名称或数据分类。回复时请保持简洁。";
        interactiveData = {
          title: "您可以选择以下项目进行查询:",
          options: [
            { id: 'p1', label: '国网一级', value: '查询国网一级项目商品' },
            { id: 'p2', label: '管网新系统', value: '查询管网新系统项目商品' },
            { id: 'p3', label: '中国通用', value: '查询中国通用项目商品' }
          ]
        };
      } else if (messageText === '最近项目更新') {
        actualPrompt = "我想了解最近的项目更新情况。请作为助手，列出几个当前最热门或变动最频繁的项目供我选择，或者直接询问我想了解哪个具体的项目。回复要亲切专业且精简。";
        interactiveData = {
          title: "请选择您想查看更新的项目:",
          options: [
            { id: 'up_1', label: '智管中心扩容', value: '查看智管中心扩容项目的最新更新情况' },
            { id: 'up_2', label: '南方电网对接', value: '查看南方电网对接项目的最新进度' },
            { id: 'up_3', label: '数字化采购平台', value: '查看数字化采购平台项目的更新日志' }
          ]
        };
      }

      await geminiRef.current.sendMessage(actualPrompt, (chunk) => {
        setIsThinking(false);
        currentResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, text: currentResponse, isThinking: false, interactiveData } 
            : msg
        ));
      });

      if (messageText.includes('RAG') || messageText.includes('政策') || messageText.includes('订单') || messageText.includes('项目')) {
        const mockSources: Source[] = [
          { 
            id: '1', 
            title: messageText.includes('订单') 
              ? '《2024年Q3订单管理系统导出的逾期明细》' 
              : messageText.includes('项目') 
                ? '《项目商品管理目录 v1.2》' 
                : '《AI 技术白皮书 v2》- 第四章' 
          },
          { 
            id: '2', 
            title: messageText.includes('订单') 
              ? '内部知识库：逾期订单处理标准流程.pdf' 
              : messageText.includes('项目')
                ? '内部知识库：各分公司项目数据同步汇总表.xlsx'
                : '内部知识库 : LLM 上下文注入规范.pdf' 
          }
        ];
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, sources: mockSources } : msg
        ));
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      setIsThinking(false);
    }
  }, [inputText, view]);

  const resetChat = () => {
    setMessages([]);
    setView(AppView.HOME);
    setFullContent(null);
    geminiRef.current = new GeminiService();
  };

  const handleBack = () => {
    if (view === AppView.FULL_CONTENT) {
      setView(AppView.CHAT);
    } else {
      setView(AppView.HOME);
    }
  };

  const handleShare = useCallback(() => {
    if (!fullContent) return;
    
    const shareMsg: Message = {
      id: Date.now().toString(),
      role: Role.MODEL,
      text: `已为您将《${fullContent.title}》分享至聊天框。如需再次查看，可随时点击上方的明细查询链接。`,
    };
    
    setMessages(prev => [...prev, shareMsg]);
    setView(AppView.CHAT);
  }, [fullContent]);

  return (
    <div className="flex justify-center min-h-screen bg-slate-100 dark:bg-slate-900 font-display">
      <div className="relative flex h-screen w-full max-w-[480px] flex-col bg-white dark:bg-background-dark shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onNewChat={resetChat} 
        />
        
        <Header 
          view={view} 
          onBack={handleBack} 
          onClear={resetChat} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main 
          ref={scrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30"
        >
          {view === AppView.HOME && (
            <HomeView onPromptSelect={(p) => handleSendMessage(p)} />
          )}
          {view === AppView.CHAT && (
            <ChatView messages={messages} isThinking={isThinking} onSuggestion={(s) => handleSendMessage(s)} />
          )}
          {view === AppView.FULL_CONTENT && (
            <FullContentView data={fullContent} onShare={handleShare} />
          )}
        </main>

        <footer className={`p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out ${view === AppView.FULL_CONTENT ? 'translate-y-full opacity-0 pointer-events-none absolute bottom-0 w-full' : 'translate-y-0 opacity-100'}`}>
          <MessageInput 
            value={inputText}
            onChange={setInputText}
            onSend={() => handleSendMessage()}
            isLoading={isThinking}
            onReset={resetChat}
            showReset={view === AppView.CHAT}
          />
        </footer>
      </div>
    </div>
  );
};

export default App;
