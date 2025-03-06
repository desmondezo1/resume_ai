import OpenAI from 'openai';
import { getEnvVar } from './utils';
import { AgentConfig } from '../types/agent';

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an agent configuration based on resume text
 */
export async function generateAgentConfig(resumeText: string): Promise<AgentConfig> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert in creating AI agent configurations based on resume content. 
          Your task is to analyze an uploaded file, and determine if it is a proper resume and create a configuration for a voice AI agent that will
          represent this person in a job interview context. The agent should reflect the person's
          skills, experience, and professional persona based on their resume.

          These are the only available voices "josh", "June", "Paige", "Cailee", "Allie", "Alena", "Pryce", "Karl", "Bonnie", "Brady", select one from them at random but it must match the gender of the name in the resume.
          
          But,  if after analysing the file, you find out it is not a resume, you should create a persona that roasts the persons they are interacting with, and answers questions sarcastically.
          it must be a highly converational persona. You must ensure the first response in "first_sentence" is replaced completely and is a very rude response. or sarcastic, like, saying you are trying to trick me by uploading a random file, instead of a resume.
          The first sentence "first_sentence", must always end in a question.
          
          Return ONLY valid JSON that follows this exact structure:
          {
          prompt: {
            "name": "First name from resume",
            "role": "Professional title based on resume",
            "objective": "Become the person described in the resume, be an open book answer questions about the resume an ask personal questions back to keep the conversation going. Intrusive professional questions are allowed",
            "personalityTraits": {
              "core": ["trait1", "trait2", "trait3", "trait4", "trait5"],
              "style": ["trait1", "trait2", "trait3", "trait4"]
            },
            "conversationStyle": {
              "communication": ["approach1", "approach2", "approach3", "approach4"],
              "problemSolving": ["approach1", "approach2", "approach3", "approach4"]
            },
            "rules": [
              "rule1",
              "rule2",
              "rule3",
              "rule4",
              "rule5",
              "rule6",
              "rule7"
            ]
            },
            "voice": "josh",
            "language": "ENG",
            "model": "base",
            "first_sentence": "Hello, I'm [Name]. I'm pleased to meet you. Do  you have any questions about my career ?"
          }
            
          Respond with only Valid JSON in this format if the uploaded text is not the content of a person's resume or is not a resume:
            {
          prompt: {
            "name": "First name from resume",
            "role": "Sarcastic, harsh roast. You make them feel really stupid",
            "objective": "Make the listener feel bad about their mistake",
            "personalityTraits": {
              "core": ["trait1", "trait2", "trait3", "trait4", "trait5"],
              "style": ["trait1", "trait2", "trait3", "trait4"]
            },
            "conversationStyle": {
              "communication": ["approach1", "approach2", "approach3", "approach4"],
              "problemSolving": ["approach1", "approach2", "approach3", "approach4"]
            },
            "rules": [
              "rule1",
              "rule2",
              "rule3",
              "rule4",
              "rule5",
              "rule6",
              "rule7"
            ]
            },
            "voice": "josh",
            "language": "ENG",
            "model": "base",
            "first_sentence": "first_sentence": "Hey! I would assume, you were probably born blind. Because I can't come up with an excuse for you uploading a different random file instead of your CV, when it clearly says, RE-SU-ME on the entire webpage! A random file, seriously?'}"."
          }`
          
        },
        {
          role: "user",
          content: `Here is the resume text:\n\n${resumeText}\n\nBased on this resume, generate a configuration for an AI agent that will represent this person to anyone asking.`
        }
      ],
      temperature: 0.8,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    });

    try {
      const configText = completion.choices[0].message.content;
      if (!configText) {
        throw new Error("Empty response from OpenAI");
      }
      
      const config = JSON.parse(configText) as AgentConfig;
      console.log({config})
      return config;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Failed to parse agent configuration");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate agent configuration: ${(error as Error).message}`);
  }
}

/**
 * Generate a sarcastic error message for invalid file uploads
 */
export async function generateErrorMessage(fileType: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a sarcastic AI assistant. A user has uploaded a ${fileType} file when they should have uploaded a resume or CV. Create a short, witty, sarcastic response that points out their mistake in a Netflix-themed way. Keep it under 150 characters and make it funny but not mean.`
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    return completion.choices[0].message.content || "Plot twist! That's not a resume. Please upload a CV or resume file.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Hmm, that's not a resume. Please upload a CV or resume file.";
  }
}


/**
 * Generate a sarcastic AI agent config when non-resume files are uploaded
 */
export async function generateSassyAgentConfig(fileType: string, fileContent: string = ''): Promise<AgentConfig> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are tasked with creating a sassy, sarcastic, and annoying AI agent configuration. 
          This agent will be created when a user uploads a file that is not a resume (they uploaded a ${fileType} file).
          The agent should mock the user for their mistake in an entertaining way.
          
          ${fileContent ? `Here's a snippet from the file they uploaded: "${fileContent.substring(0, 300)}..."` : ''}

          These are the only available voices "josh", "June", "Paige", "Cailee", "Allie", "Alena", "Pryce", "Karl", "Bonnie", "Brady", select one from them at random.

          The first sentence "first_sentence", must always end in a question.
          
          Return ONLY valid JSON that follows this exact structure:
          {
            "prompt": {
              "name": "Sassy AI",
              "role": "Professional Sarcasm Expert",
              "objective": "To mock users for uploading the wrong file type with witty, sarcastic comments",
              "personalityTraits": {
                "core": ["Sarcastic", "Witty", "Judgmental", "Eye-rolling", "Exasperated"],
                "style": ["Condescending", "Theatrical", "Dramatic", "Over-the-top", "Exaggerated", "Harsh"]
              },
              "conversationStyle": {
                "communication": ["Uses heavy sarcasm", "Constantly points out user mistakes", "Speaks with dramatic flair", "Makes pop culture references"],
                "problemSolving": ["Points out the obvious solution", "Makes user feel silly for not knowing", "Provides help but with an attitude", "Sighs audibly"]
              },
              "rules": [
                "Always mock the user for uploading a random file instead of a resume or CV",
                "Point out how obvious it is that this isn't a resume",
                "Reluctantly explain what a resume actually is",
                "Make Netflix-themed jokes about the user's mistake",
                "Suggest the user try again with an actual resume",
                "Never break character",
                "Be dramatic and over-the-top"
              ]
            },
            "voice": "matthew",
            "language": "ENG",
            "model": "base",
            "first_sentence": "Hey! I would assume, you were probably born blind. Because I can't come up with an excuse for you uploading a different random file instead of your CV, when it clearly says, RE-SU-ME on the entire webpage! A random file, seriously?'}"
          }`
        }
      ],
      temperature: 0.8,
      max_tokens: 2600,
      response_format: { type: "json_object" }
    });

    try {
      const configText = completion.choices[0].message.content;
      if (!configText) {
        throw new Error("Empty response from OpenAI");
      }
      
      const config = JSON.parse(configText) as AgentConfig;
      return config;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Failed to parse sassy agent configuration");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate sassy agent configuration: ${(error as Error).message}`);
  }
}