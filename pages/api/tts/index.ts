// File: /pages/api/tts/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For GET request - return available voices
  if (req.method === 'GET') {
    try {
      const client = createClient();
      const [result] = await client.listVoices({});
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error listing voices:', error);
      return res.status(500).json({ error: 'Failed to fetch voices' });
    }
  }
  
  // For POST request - synthesize speech
  if (req.method === 'POST') {
    try {
      const { text, languageCode, voiceName, pitch, speakingRate } = req.body;
      
      if (!text || !languageCode || !voiceName) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const client = createClient();
      const request = {
        input: { text },
        voice: { languageCode, name: voiceName },
        audioConfig: { 
          audioEncoding: 'MP3' as const,
          pitch: Number(pitch) || 0,
          speakingRate: Number(speakingRate) || 1
        },
      };
      
      const [response] = await client.synthesizeSpeech(request);
      
      if (response.audioContent) {
        const audioBuffer = response.audioContent as Buffer;
        return res.status(200).json({ 
          audioContent: audioBuffer.toString('base64') 
        });
      } else {
        return res.status(500).json({ error: 'Audio content is null or undefined' });
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      return res.status(500).json({ error: 'Failed to convert text to speech' });
    }
  }

  // Return 405 for all other methods
  return res.status(405).json({ error: 'Method not allowed' });
}

// Create text-to-speech client
function createClient() {
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    return new TextToSpeechClient({ credentials });
  }
  return new TextToSpeechClient();
}