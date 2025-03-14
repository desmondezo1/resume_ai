import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAgentConfig, generateErrorMessage, generateSassyAgentConfig } from '../../lib/openai';
import { createWebAgent } from '../../lib/bland';
import { saveAgent } from '../../db/mongodb';
import { extractNameFromResume } from '../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeText, isError, isNotResume, fileType, voiceId, voiceName } = req.body;

    // If this is an error case (not a resume), generate a sarcastic error message
    if (isError) {
      const message = await generateErrorMessage(fileType || 'unknown');
      return res.status(200).json({ message });
    }
    
    // If this is a non-resume file but we want to create a sassy agent
    if (isNotResume) {
      // Generate a sassy agent configuration
      const sassyConfig = await generateSassyAgentConfig(fileType || 'unknown');
      
      // If a voice ID was provided, use it instead of the default voice
      if (voiceId) {
        console.log(`Using custom voice: ${voiceId} (${voiceName})`);
        sassyConfig.voice = voiceId;
      }
      
      // Create agent in Bland AI
      const agentId = await createWebAgent(sassyConfig);
      
      // Save agent to database with a placeholder for resume text
      await saveAgent(agentId, sassyConfig.prompt.name, 
        "This is a sassy agent created for a non-resume file upload.", sassyConfig);
      
      // Return the agent ID
      return res.status(200).json({ agentId });
    }

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    // Generate agent configuration using OpenAI
    const agentConfig = await generateAgentConfig(resumeText);
    
    // Get a name from the resume if the config didn't extract one well
    const name = agentConfig.prompt.name || extractNameFromResume(resumeText);
    agentConfig.prompt.name = name;
    
    // If a voice ID was provided, use it instead of the default voice
    if (voiceId) {
      console.log(`Using custom voice: ${voiceId} (${voiceName})`);
      agentConfig.voice = voiceId;
    }
    
    // Create agent in Bland AI
    const agentId = await createWebAgent(agentConfig);
    
    // Save agent to database
    await saveAgent(agentId, name, resumeText, agentConfig);
    
    // Return the agent ID
    res.status(200).json({ agentId });
  } catch (error) {
    console.error('Agent generation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate agent'
    });
  }
}





















// import { generateAgentConfig, generateErrorMessage, generateSassyAgentConfig } from '../../lib/openai';
// import { createWebAgent } from '../../lib/bland';
// import { saveAgent } from '../../db/mongodb';
// import { extractNameFromResume } from '../../lib/utils';

// export const config = {
//   runtime: 'edge', // Specify Edge runtime
// };

// export default async function handler(req: Request) {
//   if (req.method !== 'POST') {
//     return new Response(JSON.stringify({ error: 'Method not allowed' }), {
//       status: 405,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }

//   try {
//     const body = await req.json();
//     const { resumeText, isError, isNotResume, fileType, voiceId, voiceName } = body;

//     // If this is an error case (not a resume), generate a sarcastic error message
//     if (isError) {
//       const message = await generateErrorMessage(fileType || 'unknown');
//       return new Response(JSON.stringify({ message }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // If this is a non-resume file but we want to create a sassy agent
//     if (isNotResume) {
//       // Generate a sassy agent configuration
//       const sassyConfig = await generateSassyAgentConfig(fileType || 'unknown');

//       // If a voice ID was provided, use it instead of the default voice
//       if (voiceId) {
//         console.log(`Using custom voice: ${voiceId} (${voiceName})`);
//         sassyConfig.voice = voiceId;
//       }

//       // Create agent in Bland AI
//       const agentId = await createWebAgent(sassyConfig);

//       // Save agent to database with a placeholder for resume text
//       await saveAgent(agentId, sassyConfig.prompt.name, 
//         "This is a sassy agent created for a non-resume file upload.", sassyConfig);

//       // Return the agent ID
//       return new Response(JSON.stringify({ agentId }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (!resumeText) {
//       return new Response(JSON.stringify({ error: 'Resume text is required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Generate agent configuration using OpenAI
//     const agentConfig = await generateAgentConfig(resumeText);

//     // Get a name from the resume if the config didn't extract one well
//     const name = agentConfig.prompt.name || extractNameFromResume(resumeText);
//     agentConfig.prompt.name = name;

//     // If a voice ID was provided, use it instead of the default voice
//     if (voiceId) {
//       console.log(`Using custom voice: ${voiceId} (${voiceName})`);
//       agentConfig.voice = voiceId;
//     }

//     // Create agent in Bland AI
//     const agentId = await createWebAgent(agentConfig);

//     // Save agent to database
//     await saveAgent(agentId, name, resumeText, agentConfig);

//     // Return the agent ID
//     return new Response(JSON.stringify({ agentId }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Agent generation error:', error);
//     return new Response(JSON.stringify({ 
//       error: error instanceof Error ? error.message : 'Failed to generate agent'
//     }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }


























// // pages/api/generate-agent.ts
// import { generateAgentConfig, generateErrorMessage, generateSassyAgentConfig } from '../../lib/openai';
// import { createWebAgent } from '../../lib/bland';
// import { extractNameFromResume } from '../../lib/utils';

// export const config = {
//   runtime: 'edge', // Specify Edge runtime
// };

// export default async function handler(req: Request) {

//   const appUrl = process.env.VERCEL_URL
//     ? `https://${process.env.VERCEL_URL}`
//     : `http://localhost:${process.env.PORT}`; // Fallback for local development

//   if (req.method !== 'POST') {
//     return new Response(JSON.stringify({ error: 'Method not allowed' }), {
//       status: 405,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }

//   try {
//     const body = await req.json();
//     const { resumeText, isError, isNotResume, fileType, voiceId, voiceName } = body;

//     // If this is an error case (not a resume), generate a sarcastic error message
//     if (isError) {
//       const message = await generateErrorMessage(fileType || 'unknown');
//       return new Response(JSON.stringify({ message }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // If this is a non-resume file but we want to create a sassy agent
//     if (isNotResume) {
//       // Generate a sassy agent configuration
//       const sassyConfig = await generateSassyAgentConfig(fileType || 'unknown');

//       // If a voice ID was provided, use it instead of the default voice
//       if (voiceId) {
//         console.log(`Using custom voice: ${voiceId} (${voiceName})`);
//         sassyConfig.voice = voiceId;
//       }

//     //   agent_id, name, resumeText, agentConfig

//       // Create agent in Bland AI
//       const agentId = await createWebAgent(sassyConfig);

//       // Call the Serverless Function to save the agent to MongoDB
//       const dbResponse = await fetch(`${appUrl}/api/db-handler`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           agent_id: agentId,
//           name: sassyConfig.prompt.name,
//           resumeText: "This is a sassy agent created for a non-resume file upload.",
//           agentConfig: sassyConfig,
//         }),
//       });

//       if (!dbResponse.ok) {
//         throw new Error('Failed to save agent to database');
//       }

//       // Return the agent ID
//       return new Response(JSON.stringify({ agentId }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (!resumeText) {
//       return new Response(JSON.stringify({ error: 'Resume text is required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Generate agent configuration using OpenAI
//     const agentConfig = await generateAgentConfig(resumeText);

//     // Get a name from the resume if the config didn't extract one well
//     const name = agentConfig.prompt.name || extractNameFromResume(resumeText);
//     agentConfig.prompt.name = name;

//     // If a voice ID was provided, use it instead of the default voice
//     if (voiceId) {
//       console.log(`Using custom voice: ${voiceId} (${voiceName})`);
//       agentConfig.voice = voiceId;
//     }

//     // Create agent in Bland AI
//     const agentId = await createWebAgent(agentConfig);

//     // Call the Serverless Function to save the agent to MongoDB
//     const dbResponse = await fetch(`${appUrl}/api/db-handler`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         agent_id: agentId,
//         name,
//         resumeText,
//         agentConfig,
//       }),
//     });

//     if (!dbResponse.ok) {
//       throw new Error('Failed to save agent to database');
//     }

//     // Return the agent ID
//     return new Response(JSON.stringify({ agentId }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Agent generation error:', error);
//     return new Response(JSON.stringify({ 
//       error: error instanceof Error ? error.message : 'Failed to generate agent'
//     }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }