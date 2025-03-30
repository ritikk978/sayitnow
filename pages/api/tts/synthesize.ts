// File: /pages/api/tts/synthesize.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

// Create text-to-speech client
function createClient() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentialsJson = Buffer.from(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      'base64'
    ).toString();

    const credentials = JSON.parse(credentialsJson);

    return new TextToSpeechClient({ credentials });
  }

  return new TextToSpeechClient();
}