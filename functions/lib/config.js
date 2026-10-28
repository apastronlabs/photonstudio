"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = exports.pikaApiKey = exports.falApiKey = exports.openRouterApiKey = void 0;
const params_1 = require("firebase-functions/params");
// Define Firebase Cloud Functions secrets
exports.openRouterApiKey = (0, params_1.defineSecret)('OPENROUTER_API_KEY');
exports.falApiKey = (0, params_1.defineSecret)('FAL_KEY');
exports.pikaApiKey = (0, params_1.defineSecret)('PIKA_API_KEY');
exports.CONFIG = {
    region: 'us-central1',
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
//# sourceMappingURL=config.js.map