import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { openRouterApiKey, falApiKey, pikaApiKey, CONFIG } from './config';
import { SeoOrchestrator } from './orchestrator';
import { HtmlCompilerService } from './services/compiler';
import { PublisherService } from './services/publisher';
import { StructuredArticleInput, SeoArticle, SeoAuthor, SeoTopic } from './types/seo';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Autonomous SEO Scheduler (Cloud Functions v2)
 * Runs daily at 04:00 AM (us-central1)
 */
export const seoAutopilotScheduler = onSchedule(
  {
    schedule: 'every day 04:00',
    timeZone: 'America/New_York',
    region: CONFIG.region,
    secrets: [openRouterApiKey, falApiKey, pikaApiKey],
    memory: '1GiB',
    timeoutSeconds: 540
  },
  async () => {
    console.log('[seoAutopilotScheduler] Starting scheduled SEO execution...');
    const openRouterKey = openRouterApiKey.value() || process.env.OPENROUTER_API_KEY || '';
    const falKey = falApiKey.value() || process.env.FAL_KEY || '';

    const orchestrator = new SeoOrchestrator(openRouterKey, falKey);
    const result = await orchestrator.runAutopilot(1);
    console.log('[seoAutopilotScheduler] Execution finished:', result);
  }
);

/**
 * Callable Function for FlutterFlow UI: Publish Structured Article Data
 * Receives structured article JSON, compiles HTML, updates author & topic pages, and refreshes sitemap.
 */
export const publishStructuredArticle = onCall(
  {
    region: CONFIG.region,
    memory: '512MiB',
    timeoutSeconds: 120
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to publish articles.');
    }

    const input = request.data as StructuredArticleInput;
    if (!input || !input.title || !input.slug || !input.description || !input.content) {
      throw new HttpsError('invalid-argument', 'Missing required article fields (title, slug, description, content).');
    }

    const compiler = new HtmlCompilerService();
    const publisher = new PublisherService();
    const db = admin.firestore();

    // 1. Compile Article HTML
    const compiled = await compiler.compileArticle(input);

    // 2. Publish HTML to public/blog/{slug}/index.html
    const filePath = await publisher.publishArticleHtml(compiled.slug, compiled.html);

    // 3. Save/Update in Firestore
    const articleDoc: Partial<SeoArticle> = {
      id: compiled.slug,
      slug: compiled.slug,
      title: input.title,
      subtitle: input.subtitle,
      metaDescription: input.description,
      canonicalUrl: compiled.canonicalUrl,
      primaryKeyword: input.primaryKeyword || input.title,
      secondaryKeywords: input.secondaryKeywords || [],
      authorId: typeof input.author === 'string' ? input.author.toLowerCase().replace(/\s+/g, '-') : input.author.slug,
      topicId: typeof input.topic === 'string' ? input.topic.toLowerCase().replace(/\s+/g, '-') : input.topic?.slug || 'creative-ai',
      readingTimeMinutes: compiled.readingTimeMinutes,
      status: 'published',
      publishedAt: input.publishedAt || new Date().toISOString(),
      updatedAt: input.updatedAt || new Date().toISOString()
    };

    await db.collection('seo_articles').doc(compiled.slug).set(articleDoc, { merge: true });

    // 4. Update Hub, Sitemap, and LLMs.txt
    const allArticlesSnap = await db.collection('seo_articles').where('status', '==', 'published').get();
    const allArticles = allArticlesSnap.docs.map(d => d.data() as SeoArticle);
    const allTopicsSnap = await db.collection('seo_topics').get();
    const allTopics = allTopicsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as SeoTopic);
    const allAuthorsSnap = await db.collection('seo_authors').get();
    const allAuthors = allAuthorsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as SeoAuthor);

    const hubHtml = compiler.compileBlogHub(allArticles, allTopics);
    await publisher.publishBlogHubHtml(hubHtml);
    await publisher.regenerateSitemap(allArticles, allAuthors, allTopics);
    await publisher.updateLlmsTxt(allArticles);

    return {
      success: true,
      slug: compiled.slug,
      canonicalUrl: compiled.canonicalUrl,
      filePath,
      publishedAt: articleDoc.publishedAt
    };
  }
);

/**
 * HTTPS Webhook/API endpoint for external backend triggers (with API key security)
 */
export const publishArticleHttp = onRequest(
  {
    region: CONFIG.region,
    memory: '512MiB',
    timeoutSeconds: 120
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    const input = req.body as StructuredArticleInput;
    if (!input || !input.title || !input.slug || !input.description || !input.content) {
      res.status(400).json({ error: 'Missing required article fields (title, slug, description, content).' });
      return;
    }

    try {
      const compiler = new HtmlCompilerService();
      const publisher = new PublisherService();
      const db = admin.firestore();

      const compiled = await compiler.compileArticle(input);
      const filePath = await publisher.publishArticleHtml(compiled.slug, compiled.html);

      const articleDoc: Partial<SeoArticle> = {
        id: compiled.slug,
        slug: compiled.slug,
        title: input.title,
        subtitle: input.subtitle,
        metaDescription: input.description,
        canonicalUrl: compiled.canonicalUrl,
        primaryKeyword: input.primaryKeyword || input.title,
        secondaryKeywords: input.secondaryKeywords || [],
        authorId: typeof input.author === 'string' ? input.author.toLowerCase().replace(/\s+/g, '-') : input.author.slug,
        topicId: typeof input.topic === 'string' ? input.topic.toLowerCase().replace(/\s+/g, '-') : input.topic?.slug || 'creative-ai',
        readingTimeMinutes: compiled.readingTimeMinutes,
        status: 'published',
        publishedAt: input.publishedAt || new Date().toISOString(),
        updatedAt: input.updatedAt || new Date().toISOString()
      };

      await db.collection('seo_articles').doc(compiled.slug).set(articleDoc, { merge: true });

      const allArticlesSnap = await db.collection('seo_articles').where('status', '==', 'published').get();
      const allArticles = allArticlesSnap.docs.map(d => d.data() as SeoArticle);
      const allTopicsSnap = await db.collection('seo_topics').get();
      const allTopics = allTopicsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as SeoTopic);
      const allAuthorsSnap = await db.collection('seo_authors').get();
      const allAuthors = allAuthorsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as SeoAuthor);

      const hubHtml = compiler.compileBlogHub(allArticles, allTopics);
      await publisher.publishBlogHubHtml(hubHtml);
      await publisher.regenerateSitemap(allArticles, allAuthors, allTopics);
      await publisher.updateLlmsTxt(allArticles);

      res.status(200).json({
        success: true,
        slug: compiled.slug,
        url: `${CONFIG.siteUrl}/blog/${compiled.slug}/`,
        filePath
      });
    } catch (err: any) {
      console.error('[publishArticleHttp Error]', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Callable Function for FlutterFlow UI: Trigger an autonomous batch run on-demand
 */
export const triggerAutopilotRun = onCall(
  {
    region: CONFIG.region,
    secrets: [openRouterApiKey, falApiKey, pikaApiKey],
    memory: '1GiB',
    timeoutSeconds: 540
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to trigger SEO runs.');
    }

    const maxArticles = (request.data?.maxArticles as number) || 1;
    const openRouterKey = openRouterApiKey.value() || process.env.OPENROUTER_API_KEY || '';
    const falKey = falApiKey.value() || process.env.FAL_KEY || '';

    const orchestrator = new SeoOrchestrator(openRouterKey, falKey);
    const result = await orchestrator.runAutopilot(maxArticles);

    return {
      success: true,
      processedKeywords: result.processedKeywords,
      publishedArticles: result.publishedArticles,
      errors: result.errors
    };
  }
);

/**
 * Callable Function for FlutterFlow UI: Research topic clusters and keywords
 */
export const generateTopicClusters = onCall(
  {
    region: CONFIG.region,
    secrets: [openRouterApiKey]
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const seedTopic = (request.data?.seedTopic as string) || 'AI filmmaking and video generation';
    const openRouterKey = openRouterApiKey.value() || process.env.OPENROUTER_API_KEY || '';

    const { OpenRouterService } = await import('./services/openrouter');
    const service = new OpenRouterService(openRouterKey);

    const research = await service.discoverKeywordsAndClusters(seedTopic);

    const db = admin.firestore();
    const batch = db.batch();

    for (const t of research.topics) {
      const ref = db.collection('seo_topics').doc(t.slug);
      batch.set(ref, {
        ...t,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    for (const k of research.keywords) {
      const ref = db.collection('seo_keywords').doc();
      batch.set(ref, {
        id: ref.id,
        keyword: k.keyword,
        searchIntent: k.searchIntent,
        difficulty: k.difficulty,
        clusterName: k.clusterName,
        status: 'discovered',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await batch.commit();

    return {
      success: true,
      topicsCount: research.topics.length,
      keywordsCount: research.keywords.length,
      topics: research.topics,
      keywords: research.keywords
    };
  }
);
