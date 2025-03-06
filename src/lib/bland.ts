import { AgentConfig } from '../types/agent';
import { getEnvVar } from './utils';

const BLAND_API_KEY = process.env.BLAND_API_KEY || '';
const BLAND_API_URL = 'https://api.bland.ai';
const BLAND_WEB_URL = 'https://api.bland.ai';

if (!BLAND_API_KEY) {
  console.warn('BLAND_API_KEY is not set in environment variables');
}

export async function createWebAgent(config: AgentConfig): Promise<string> {
  try {
    console.log('Creating new web agent...');
    console.log(config)
    const response = await fetch(`${BLAND_API_URL}/v1/agents`, {
      method: 'POST',
      headers: {
        'authorization': BLAND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agent creation error:', errorText);
      throw new Error(`Failed to create agent: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created agent:', data);
    
    if (!data.agent?.agent_id) {
      throw new Error('Failed to get agent ID from response');
    }
    
    return data.agent.agent_id;
  } catch (error: any) {
    console.error('Error creating agent:', error);
    throw error;
  }
}

export async function getSessionToken(agentId: string): Promise<string> {
  try {
    const response = await fetch(`${BLAND_WEB_URL}/v1/agents/${agentId}/authorize`, {
      method: 'POST',
      headers: {
        'authorization': BLAND_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('No token in response');
    }
    
    return data.token;
  } catch (error) {
    console.error('Error getting session token:', error);
    throw error;
  }
}

export async function deleteAgent(agentId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BLAND_API_URL}/v1/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        'authorization': BLAND_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete agent: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
}

export async function createVoiceClone(audioBlob: Blob, voiceName: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('name', voiceName);
    formData.append('audio_samples', audioBlob);

    const response = await fetch(`${BLAND_API_URL}/v1/voices`, {
      method: 'POST',
      headers: {
        'authorization': BLAND_API_KEY,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create voice clone: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created voice clone:', data);
    
    if (!data.voice_id) {
      throw new Error('Failed to get voice ID from response');
    }
    
    return data.voice_id.toString();
  } catch (error) {
    console.error('Error creating voice clone:', error);
    throw error;
  }
}