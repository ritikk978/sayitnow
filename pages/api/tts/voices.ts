// File: /pages/api/tts/voices.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = createClient();
    const [result] = await client.listVoices({});
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error listing voices:', error);
    return res.status(500).json({ error: 'Failed to fetch voices' });
  }
}

// Create text-to-speech client
function createClient() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    return new TextToSpeechClient({ credentials });
  }
  return new TextToSpeechClient();
}