
import React, { KeyboardEvent, useState, useRef } from 'react';

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onReset: () => void;
  showReset: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  isLoading, 
  onReset, 
  showReset 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
      setAttachedFile(null); // Clear attachment on send
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate finishing transcription
      if (!value) onChange("这是一段模拟语音转文字的内容...");
    } else {
      setIsRecording(true);
      // In a real app, we'd start Web Speech API here
      setTimeout(() => {
        if (isRecording) setIsRecording(false);
      }, 5000);
    }
  };

  return (
    <div className="space-y-3">
      {showReset && (
        <div className="flex items-center justify-between px-1">
          <button 
            onClick={onReset}
            className="flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors group"
          >
            <span className="material-symbols-outlined text-[18px] group-active:scale-90 transition-transform">refresh</span>
            <span className="text-[12px] font-medium">清空并新对话</span>
          </button>
          <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent"></div>
        </div>
      )}

      {/* File Attachment Preview */}
      {attachedFile && (
        <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 dark:bg-primary/10 rounded-lg w-fit animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[18px]">description</span>
          <span className="text-[12px] text-primary font-medium truncate max-w-[150px]">{attachedFile.name}</span>
          <button 
            onClick={() => setAttachedFile(null)}
            className="text-primary/60 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3 text-[#4c739a] pointer-events-none">
            {isRecording ? (
              <div className="flex gap-0.5">
                <span className="w-1 h-3 bg-red-500 rounded-full animate-[pulse_1s_infinite]"></span>
                <span className="w-1 h-3 bg-red-500 rounded-full animate-[pulse_1.2s_infinite]"></span>
                <span className="w-1 h-3 bg-red-500 rounded-full animate-[pulse_0.8s_infinite]"></span>
              </div>
            ) : (
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            )}
          </div>
          
          <input 
            className={`w-full h-12 pl-10 pr-24 rounded-xl bg-slate-100 dark:bg-slate-900 border-none focus:ring-2 focus:ring-primary/20 text-[#0d141b] dark:text-slate-100 placeholder:text-[#4c739a] dark:placeholder:text-slate-500 text-sm transition-all
              ${isRecording ? 'animate-pulse ring-2 ring-red-500/20' : ''}
            `}
            placeholder={isRecording ? "正在倾听..." : "问问我关于公司知识库的问题..."} 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isRecording}
          />

          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />

          <div className="absolute right-2 flex items-center gap-1">
            <button 
              onClick={handleFileClick}
              disabled={isLoading || isRecording}
              className={`p-1.5 transition-colors ${attachedFile ? 'text-primary' : 'text-[#4c739a] hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-[22px]" style={attachedFile ? { fontVariationSettings: "'FILL' 1" } : {}}>attach_file</span>
            </button>
            <button 
              onClick={toggleRecording}
              disabled={isLoading}
              className={`p-1.5 transition-all relative ${isRecording ? 'text-red-500' : 'text-[#4c739a] hover:text-primary'}`}
            >
              {isRecording && (
                <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></span>
              )}
              <span className="material-symbols-outlined text-[22px]" style={isRecording ? { fontVariationSettings: "'FILL' 1" } : {}}>mic</span>
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => { onSend(); setAttachedFile(null); }}
          disabled={isLoading || (!value.trim() && !attachedFile) || isRecording}
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all shrink-0 shadow-lg shadow-primary/20
            ${(isLoading || (!value.trim() && !attachedFile) || isRecording)
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-primary text-white active:scale-95'
            }
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          )}
        </button>
      </div>
      
      <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-2"></div>
    </div>
  );
};

export default MessageInput;
