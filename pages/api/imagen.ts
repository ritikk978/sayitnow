import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if the environment variable exists
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is missing');
    }
    
    // Decode the base64 credentials
    const credentialsJson = Buffer.from(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      'base64'
    ).toString();
    
    const credentials = JSON.parse(credentialsJson);
    
    // Create a GoogleAuth instance
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // Get an access token
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();

    if (!tokenResponse.token) {
      throw new Error('Failed to obtain access token');
    }

    // Make request to Google Imagen API
    const projectId = 'silken-obelisk-454907-v9';
    const locationId = 'us-central1';
    const modelId = 'imagen-3.0-generate-002';
    const apiEndpoint = 'us-central1-aiplatform.googleapis.com';

    const response = await axios.post(
      `https://${apiEndpoint}/v1/projects/${projectId}/locations/${locationId}/publishers/google/models/${modelId}:predict`,
      req.body.requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponse.token}`
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: unknown) {
    console.error('Error details:', error);

    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    }

    return res.status(500).json({ 
      error: 'Failed to generate images',
      message: errorMessage
    });
  }
}
