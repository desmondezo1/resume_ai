import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { AgentConfig } from '../types/agent';

// Ensure a single database connection is maintained across all requests
let db: any = null;

export async function getDB() {
  if (db) return db;

  db = await open({
    filename: process.env.DB_PATH || path.resolve('./resume-agents.db'),
    driver: sqlite3.Database,
  });

  // Initialize the database
  await db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      resumeText TEXT,
      config TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

export async function saveAgent(agentId: string, name: string, resumeText: string, config: AgentConfig) {
  const db = await getDB();
  await db.run(
    'INSERT OR REPLACE INTO agents (id, name, resumeText, config) VALUES (?, ?, ?, ?)',
    [agentId, name, resumeText, JSON.stringify(config)]
  );
  return { agentId };
}

export async function getAgent(agentId: string) {
  const db = await getDB();
  const agent = await db.get('SELECT * FROM agents WHERE id = ?', [agentId]);
  
  if (!agent) return null;
  
  return {
    ...agent,
    config: JSON.parse(agent.config)
  };
}

export async function listAgents() {
  const db = await getDB();
  const agents = await db.all('SELECT id, name, created_at FROM agents ORDER BY created_at DESC');
  return agents;
}

export async function deleteAgent(agentId: string) {
  const db = await getDB();
  await db.run('DELETE FROM agents WHERE id = ?', [agentId]);
  return { success: true };
}