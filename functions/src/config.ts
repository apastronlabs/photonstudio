import { defineSecret } from 'firebase-functions/params';

// Define Firebase Cloud Functions secrets
export const openRouterApiKey = defineSecret('OPENROUTER_API_KEY');
export const falApiKey = defineSecret('FAL_KEY');
export const pikaApiKey = defineSecret('PIKA_API_KEY');

export const CONFIG = {
  region: 'us-central1' as const,
  siteUrl: 'https://photonstudio.ai',
  siteName: 'Photon Studio',
  publisherOrganization: 'Apastron Labs Pvt Ltd',
  defaultModel: 'anthropic/claude-3.5-sonnet',
  fastModel: 'openai/gpt-4o-mini',
  falModel: 'fal-ai/flux/schnell',
  brandKeywords: [
    'Photon Studio',
    'Higgsfield AI',
    'Nano Banana Pro',
    'Seedance 2.0',
    'Veo 3.1',
    'ChatGPT Image 2',
    'AI Cinema Studio',
    'AI Marketing Studio'
  ]
};
