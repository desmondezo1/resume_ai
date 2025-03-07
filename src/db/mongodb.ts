import { MongoClient, Db, Collection } from 'mongodb';
import { Agent, AgentConfig } from '../types/agent';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net';
const MONGODB_DB = process.env.MONGODB_DB || 'resumeai';

// Cache the database connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Connect to MongoDB
export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new connection
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Get the agents collection
export async function getAgentsCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection('agents');
}

// Save an agent
export async function saveAgent(agentId: string, name: string, resumeText: string, config: AgentConfig) {
  const collection = await getAgentsCollection();
  
  const doc = {
    id: agentId,
    name,
    resumeText,
    config,
    created_at: new Date().toISOString() // Store as ISO string for consistency
  };
  
  await collection.updateOne(
    { id: agentId },
    { $set: doc },
    { upsert: true }
  );
  
  return { agentId };
}

// Get an agent by ID
export async function getAgent(agentId: string) {
  const collection = await getAgentsCollection();
  const agent = await collection.findOne({ id: agentId });
  
  if (!agent) return null;
  
  // Properly transform MongoDB document to Agent type
  return {
    id: agent.id as string,
    name: agent.name as string,
    resumeText: agent.resumeText as string,
    config: agent.config as AgentConfig,
    created_at: agent.created_at as string
  } as Agent;
}

// List all agents
export async function listAgents() {
  const collection = await getAgentsCollection();
  const agentsData = await collection.find({}, { 
    projection: { id: 1, name: 1, created_at: 1, _id: 0 },
    sort: { created_at: -1 }
  }).toArray();
  
  // Convert MongoDB documents to the expected format
  return agentsData.map(agent => ({
    id: agent.id as string,
    name: agent.name as string,
    created_at: agent.created_at instanceof Date ? 
      agent.created_at.toISOString() : 
      agent.created_at as string
  }));
}

// Delete an agent
export async function deleteAgent(agentId: string) {
  const collection = await getAgentsCollection();
  await collection.deleteOne({ id: agentId });
  return { success: true };
}