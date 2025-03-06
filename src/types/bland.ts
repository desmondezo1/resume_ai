export interface BlandAgent {
  agent_id: string;
  prompt: string;
  voice: string;
  language: string;
  model: string;
}

export interface BlandTokenResponse {
  token: string;
  expires_at: string;
}

export interface BlandError {
  error: string;
  message: string;
  status: number;
}

// Add for TypeScript compatibility with Bland Client SDK
declare global {
  interface Window {
    BlandWebClient: any;
  }
}

// Instead of redeclaring the class, use a module augmentation approach
declare module 'bland-client-js-sdk' {
  // This uses interface merging instead of class redeclaration
  interface BlandWebClient {
    initConversation(options: { sampleRate: number; callId: string }): Promise<void>;
  }
}