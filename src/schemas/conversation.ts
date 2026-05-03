export type Message = {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};
