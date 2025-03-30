// In pages/api/imagen.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if environment variable exists
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not defined');
    }
    
    // Parse the service account credentials from env variable
    const credentials = JSON.parse(credentialsJson);
    
    // Create a new GoogleAuth instance with the credentials
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']  // This scope should work for most Google Cloud APIs
    });
    
    // Get a client and request a token
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    // Check if token exists
    if (!tokenResponse.token) {
      throw new Error('Failed to obtain access token');
    }
    
    // Use the token for the Imagen API request
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
    
    // Properly handle the unknown error type
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