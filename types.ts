
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

// Admin Specific Types
export interface MaskingRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  isActive: boolean;
}

export interface GuidanceCommand {
  id: string;
  icon: string;
  label: string;
  action: string;
}

export interface AdminStats {
  totalDocs: number;
  totalQueries: number;
  accuracyRate: string;
  activeUsers: number;
  intentDistribution: {
    direct: number; // > 0.9
    clarify: number; // 0.6 - 0.9
    fail: number; // < 0.6
  };
}

export interface KnowledgeDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'indexed' | 'processing' | 'error';
  updatedAt: string;
}
