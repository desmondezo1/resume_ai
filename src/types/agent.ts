/**
 * Defines the personality traits of an agent
 */
export interface PersonalityTrait {
  core: string[];
  style: string[];
}

/**
 * Defines the conversation style of an agent
 */
export interface ConversationStyle {
  communication: string[];
  problemSolving: string[];
}

/**
 * Configuration for the agent prompt
 */
export interface PromptConfig {
  name: string;
  role: string;
  objective: string;
  personalityTraits: PersonalityTrait;
  conversationStyle: ConversationStyle;
  rules: string[];
}

/**
 * Configuration for a Bland AI agent
 */
export interface AgentConfig {
  prompt: PromptConfig;
  voice: string;
  language: string;
  model: string;
  first_sentence: string;
}

/**
 * Represents a stored agent with its configuration
 */
export interface Agent {
  id: string;
  name: string;
  resumeText?: string;
  config: AgentConfig;
  created_at: string;
}

/**
 * Response from the Bland AI API when creating an agent
 */
export interface AgentResponse {
  agent: {
    agent_id: string;
    [key: string]: any;
  };
  token?: string;
}