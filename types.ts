
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Source {
  id: string;
  title: string;
}

export interface InteractiveOption {
  id: string;
  label: string;
  value: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  sources?: Source[];
  isThinking?: boolean;
  interactiveData?: {
    title: string;
    options: InteractiveOption[];
  };
}

export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT',
  FULL_CONTENT = 'FULL_CONTENT'
}

export enum AppMode {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum DisplayMode {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP'
}

export interface FullContentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface FullContentData {
  title: string;
  items: FullContentItem[];
}

// --- Admin Specific Types ---

export interface IntentOverrideRule {
  id: string;
  name: string;
  keywords: string[];
  targetIntent: string;
  parameters: string; // JSON string
  isActive: boolean;
}

export interface IntentCategory {
  id: string;
  code: string;
  name: string;
  color: string;
  description: string;
}

export interface AtomicIntent {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string; // References IntentCategory code
}

export interface ClarificationConfig {
  id: string;
  title: string;
  options: { label: string; value: string; mappingParams: string }[];
}

export interface DataConnector {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'apiKey' | 'token' | 'none';
  mapping: {
    titleField: string;
    subtitleField: string;
    statusField: string;
  };
}

export interface MaskingRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  isActive: boolean;
}

export interface BadCase {
  id: string;
  query: string;
  aiResponse: string;
  correction: string;
  timestamp: string;
}

export interface AdminStats {
  totalDocs: number;
  totalQueries: number;
  accuracyRate: string;
  activeUsers: number;
  
  // 新增指标
  directHitRate: number;      // 意图直接命中率 (%)
  clarifyConvRate: number;    // 澄清转化率 (%)
  overrideRatio: number;      // 人工干预占比 (%)
  correctionRate: number;     // 修正性输入率 (%)
  outOfScopeRate: number;     // 意图越界率 (%)
  avgLatency: number;         // 平均响应耗时 (s)
  apiSuccessRate: number;     // API 成功率 (%)
  viewThroughRate: number;    // 详情穿透率 (%)

  intentDistribution: {
    name: string;
    count: number;
    percent: number;
    color: string;
  }[];
}
