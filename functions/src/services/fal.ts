export class FalService {
  private apiKey: string;
  private endpoint = 'https://queue.fal.run/fal-ai/flux/schnell';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generates a high quality WebP image via fal.ai
   */
  async generateImage(prompt: string): Promise<{
    url: string;
    width: number;
    height: number;
  }> {
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

      const data = (await response.json()) as any;
      const imageUrl = data.images?.[0]?.url;

      if (!imageUrl) {
        throw new Error('No image URL returned from fal.ai');
      }

      return {
        url: imageUrl,
        width: 1200,
        height: 675
      };
    } catch (err: any) {
      console.error('FalService error:', err);
      return {
        url: 'https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg',
        width: 1200,
        height: 675
      };
    }
  }
}
