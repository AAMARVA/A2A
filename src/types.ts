export interface DocSection {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  summary?: string;
  content: string;
  badge?: string;
  iconName?: string;
}

export interface NavCategory {
  id: string;
  title: string;
  icon: string;
  items: {
    id: string;
    title: string;
    badge?: string;
  }[];
}

export interface ProtoMessageField {
  name: string;
  type: string;
  number: number;
  description: string;
  isRepeated?: boolean;
  isOptional?: boolean;
}

export interface ProtoMessageDef {
  name: string;
  description: string;
  fields: ProtoMessageField[];
}

export interface AgentCardMock {
  name: string;
  description: string;
  url: string;
  version: string;
  skills: {
    id: string;
    name: string;
    description: string;
    inputSchema?: string;
  }[];
  capabilities: {
    streaming: boolean;
    async: boolean;
    pushNotifications: boolean;
  };
}

export interface A2ATaskMessage {
  id: string;
  timestamp: string;
  sender: 'Client' | 'Agent' | 'TargetAgent';
  type: 'CreateTask' | 'TaskStatus' | 'TaskArtifact' | 'TaskComplete' | 'CancelTask';
  payload: any;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
