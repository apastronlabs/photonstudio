import { SeoBrief, SeoTopic, SeoAuthor } from '../types/seo';
import { CONFIG } from '../config';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(messages: OpenRouterMessage[], model = CONFIG.defaultModel, temperature = 0.7): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': CONFIG.siteUrl,
            'X-Title': 'Photon Studio SEO Autopilot',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
        }

        const data = (await response.json()) as any;
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from OpenRouter');
        }
        return content;
      } catch (err: any) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      }
    }

    throw new Error('OpenRouter request failed after retries');
  }

  /**
   * Research keywords and group them into topical clusters
   */
  async discoverKeywordsAndClusters(seedTopic: string): Promise<{
    topics: { name: string; slug: string; description: string }[];
    keywords: { keyword: string; searchIntent: 'informational' | 'commercial' | 'transactional'; clusterName: string; difficulty: number }[];
  }> {
    const prompt = `
You are the Chief SEO Strategist for Photon Studio (https://photonstudio.ai), a premier AI creative platform for filmmakers, creators, and marketing studios featuring AI Cinema Studio, AI Marketing Studio, Canvas moodboards/workflows, and state-of-the-art models (Higgsfield AI, Nano Banana Pro, Seedance 2.0, Veo 3.1, ChatGPT Image 2).

Seed Topic: "${seedTopic}"

Goal:
1. Identify 2-3 logical topic clusters with clear topical authority.
2. Discover 6-10 high-value, specific, search-intent-aligned keywords across these clusters.
3. Categorize intent correctly ('informational', 'commercial', 'transactional').
4. Estimate realistic search difficulty (0 to 100).

Return valid JSON with format:
{
  "topics": [
    { "name": string, "slug": string, "description": string }
  ],
  "keywords": [
    { "keyword": string, "searchIntent": "informational"|"commercial"|"transactional", "clusterName": string, "difficulty": number }
  ]
}
`;

    const raw = await this.request([
      { role: 'system', content: 'You are an elite SEO strategist specializing in generative AI and video production workflows.' },
      { role: 'user', content: prompt }
    ], CONFIG.defaultModel, 0.4);

    return JSON.parse(raw);
  }

  /**
   * Create a comprehensive, human-centric content brief
   */
  async generateContentBrief(
    keyword: string,
    topic: SeoTopic,
    existingArticleTitles: string[]
  ): Promise<SeoBrief> {
    const prompt = `
Create a thorough, professional content brief for the keyword: "${keyword}".
Topic Cluster: "${topic.name}" - ${topic.description}

Existing Articles on our site to prevent cannibalization and support internal linking:
${existingArticleTitles.map(t => `- ${t}`).join('\n') || 'None yet'}

Photon Studio Product Context:
- Free & Pro AI Video and Image generation
- Studio Features: One Canvas workflow, Relighting, Re-character sheets, InPaint, Upscale, Camera Angles, Ads Factory, Cinema Factory
- Integrated AI Models: Higgsfield AI, Nano Banana Pro, Seedance 2.0 (4K), Veo 3.1, ChatGPT Image 2

Requirements:
- Emphasize original insight, practical workflow steps, real-world creator use cases, and factual accuracy.
- Outline 4 to 6 H2 sections (with selective H3 subheadings) that directly fulfill the user's search intent.
- Do NOT encourage generic fluff or AI cliches.
- Highlight specific Photon Studio capabilities naturally where genuinely helpful to the reader.

Return JSON in this structure:
{
  "workingTitle": string,
  "searchIntent": "informational"|"commercial"|"transactional",
  "targetWordCount": number (e.g. 1500 to 2200),
  "competitorOutlines": string[],
  "contentGaps": string[],
  "productFeaturesToHighlight": string[],
  "outline": [
    {
      "heading": string,
      "level": 2 or 3,
      "keyPoints": string[],
      "suggestedInternalLinks": string[],
      "visualPromptIdea": string
    }
  ]
}
`;

    const raw = await this.request([
      { role: 'system', content: 'You are a Senior Content Architect who crafts actionable, high-quality search briefs.' },
      { role: 'user', content: prompt }
    ], CONFIG.defaultModel, 0.5);

    const parsed = JSON.parse(raw);
    return {
      id: '',
      primaryKeyword: keyword,
      secondaryKeywords: [],
      workingTitle: parsed.workingTitle,
      searchIntent: parsed.searchIntent,
      targetWordCount: parsed.targetWordCount || 1800,
      competitorOutlines: parsed.competitorOutlines || [],
      contentGaps: parsed.contentGaps || [],
      productFeaturesToHighlight: parsed.productFeaturesToHighlight || [],
      outline: parsed.outline,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Write an authoritative, original article based on the brief
   */
  async writeArticleDraft(
    brief: SeoBrief,
    author: SeoAuthor,
    availableLinks: { title: string; url: string }[]
  ): Promise<{
    title: string;
    metaDescription: string;
    slug: string;
    contentMarkdown: string;
    imagePrompt: string;
  }> {
    const prompt = `
Write an in-depth, authoritative, original guide based on this brief:

Working Title: "${brief.workingTitle}"
Primary Keyword: "${brief.primaryKeyword}"
Search Intent: ${brief.searchIntent}
Author: ${author.name}, ${author.role} (${author.bio})
Target Word Count: ${brief.targetWordCount}

Brief Outline:
${JSON.stringify(brief.outline, null, 2)}

Product Features to naturally reference:
${brief.productFeaturesToHighlight.join(', ')}

Available Internal Links to include naturally in Markdown syntax [Anchor Text](URL):
${availableLinks.map(l => `- [${l.title}](${l.url})`).join('\n') || '- [Photon Studio AI Image Generation](https://photonstudio.ai/imageGenerator)\n- [Photon Studio AI Video Generation](https://photonstudio.ai/videoGenerator)\n- [Photon Studio Pricing](https://photonstudio.ai/pricing)'}

Writing Guidelines:
1. Tone: Expert, creative, direct, engaging, and professional. Write as a master creator and technologist.
2. Structure: Use clean Markdown (# for title, ## for H2, ### for H3). Include bullet lists, practical step-by-step instructions, and realistic prompt examples formatted in code blocks.
3. No Fluff: Avoid opening sentences like "In today's fast-paced digital world...". Start directly with the core problem or insight.
4. Factual Accuracy: Accurately explain how video generation and model capabilities work.
5. Create a slug that is clean, lowercase, and hyphenated (e.g., 'ai-video-generation-guide').
6. Provide an image generation prompt for fal.ai (Flux) to create a cinematic, hyper-realistic 16:9 hero image.

Return valid JSON with:
{
  "title": string (50-60 chars),
  "metaDescription": string (145-155 chars, engaging, includes keyword),
  "slug": string,
  "contentMarkdown": string (full markdown article),
  "imagePrompt": string (cinematic photo prompt, photorealistic, 16:9)
}
`;

    const raw = await this.request([
      { role: 'system', content: 'You are an award-winning creative technologist and AI filmmaker writing for Photon Studio.' },
      { role: 'user', content: prompt }
    ], CONFIG.defaultModel, 0.6);

    return JSON.parse(raw);
  }

  /**
   * Fact-check and refine article draft
   */
  async factCheckAndRefine(
    title: string,
    contentMarkdown: string
  ): Promise<{
    score: number; // 0 to 100
    isApproved: boolean;
    critique: string;
    refinedMarkdown: string;
  }> {
    const prompt = `
Perform a rigorous fact-check and editorial quality review of this article draft:

Title: "${title}"

Draft Markdown:
${contentMarkdown}

Check for:
1. Hallucinated or false technical claims about AI video/image models.
2. Overly generic AI filler or buzzwords.
3. Clear formatting and actionable steps.
4. Logical flow and human readability.

If needed, make refined edits directly to the Markdown to correct errors or tighten prose.

Return JSON:
{
  "score": number (0 to 100),
  "isApproved": boolean (true if score >= 80),
  "critique": string (summary of findings),
  "refinedMarkdown": string (corrected, final version of the article)
}
`;

    const raw = await this.request([
      { role: 'system', content: 'You are a meticulous technical editor and AI verification specialist.' },
      { role: 'user', content: prompt }
    ], CONFIG.defaultModel, 0.2);

    return JSON.parse(raw);
  }
}
