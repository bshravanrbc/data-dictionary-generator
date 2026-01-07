
export interface ColumnDefinition {
  name: string;
  inferred_type: string;
  description: string;
  constraints: string[];
  example_values: string[];
  business_logic?: string;
}

export interface DataDictionary {
  table_name: string;
  summary: string;
  columns: ColumnDefinition[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type InputMode = 'paste' | 'upload';

export interface AppState {
  isLoading: boolean;
  isChatLoading: boolean;
  error: string | null;
  dictionary: DataDictionary | null;
  rawInput: string;
  chatHistory: ChatMessage[];
}
