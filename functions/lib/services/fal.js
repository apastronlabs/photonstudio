"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FalService = void 0;
class FalService {
    apiKey;
    endpoint = 'https://queue.fal.run/fal-ai/flux/schnell';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Generates a high quality WebP image via fal.ai
     */
    async generateImage(prompt) {
        if (!this.apiKey) {
            console.warn('FAL_KEY is not configured. Falling back to default brand asset.');
            return {
                url: 'https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg',
                width: 1200,
                height: 675
            };
        }
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: `${prompt}, professional cinematography, 8k resolution, photorealistic, subtle studio lighting`,
                    image_size: 'landscape_16_9',
                    num_inference_steps: 4,
                    enable_safety_checker: true
                })
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`fal.ai generation failed (${response.status}): ${text}`);
            }
            const data = (await response.json());
            const imageUrl = data.images?.[0]?.url;
            if (!imageUrl) {
                throw new Error('No image URL returned from fal.ai');
            }
            return {
                url: imageUrl,
                width: 1200,
                height: 675
            };
        }
        catch (err) {
            console.error('FalService error:', err);
            return {
                url: 'https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg',
                width: 1200,
                height: 675
            };
        }
    }
}
exports.FalService = FalService;
//# sourceMappingURL=fal.js.map