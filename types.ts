
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
