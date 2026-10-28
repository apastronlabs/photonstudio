"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTopicClusters = exports.triggerAutopilotRun = exports.publishArticleHttp = exports.publishStructuredArticle = exports.seoAutopilotScheduler = void 0;
const admin = __importStar(require("firebase-admin"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("./config");
const orchestrator_1 = require("./orchestrator");
const compiler_1 = require("./services/compiler");
const publisher_1 = require("./services/publisher");
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * Autonomous SEO Scheduler (Cloud Functions v2)
 * Runs daily at 04:00 AM (us-central1)
 */
exports.seoAutopilotScheduler = (0, scheduler_1.onSchedule)({
    schedule: 'every day 04:00',
    timeZone: 'America/New_York',
    region: config_1.CONFIG.region,
    secrets: [config_1.openRouterApiKey, config_1.falApiKey, config_1.pikaApiKey],
    memory: '1GiB',
    timeoutSeconds: 540
}, async () => {
    console.log('[seoAutopilotScheduler] Starting scheduled SEO execution...');
    const openRouterKey = config_1.openRouterApiKey.value() || process.env.OPENROUTER_API_KEY || '';
    const falKey = config_1.falApiKey.value() || process.env.FAL_KEY || '';
    const orchestrator = new orchestrator_1.SeoOrchestrator(openRouterKey, falKey);
    const result = await orchestrator.runAutopilot(1);
    console.log('[seoAutopilotScheduler] Execution finished:', result);
});
/**
 * Callable Function for FlutterFlow UI: Publish Structured Article Data
 * Receives structured article JSON, compiles HTML, updates author & topic pages, and refreshes sitemap.
 */
exports.publishStructuredArticle = (0, https_1.onCall)({
    region: config_1.CONFIG.region,
    memory: '512MiB',
    timeoutSeconds: 120
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated to publish articles.');
    }
    const input = request.data;
    if (!input || !input.title || !input.slug || !input.description || !input.content) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required article fields (title, slug, description, content).');
    }
    const compiler = new compiler_1.HtmlCompilerService();
    const publisher = new publisher_1.PublisherService();
    const db = admin.firestore();
    // 1. Compile Article HTML
    const compiled = await compiler.compileArticle(input);
    // 2. Publish HTML to public/blog/{slug}/index.html
    const filePath = await publisher.publishArticleHtml(compiled.slug, compiled.html);
    // 3. Save/Update in Firestore
    const articleDoc = {
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
    const allArticles = allArticlesSnap.docs.map(d => d.data());
    const allTopicsSnap = await db.collection('seo_topics').get();
    const allTopics = allTopicsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const allAuthorsSnap = await db.collection('seo_authors').get();
    const allAuthors = allAuthorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
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
});
/**
 * HTTPS Webhook/API endpoint for external backend triggers (with API key security)
 */
exports.publishArticleHttp = (0, https_1.onRequest)({
    region: config_1.CONFIG.region,
    memory: '512MiB',
    timeoutSeconds: 120
}, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
    }
    const input = req.body;
    if (!input || !input.title || !input.slug || !input.description || !input.content) {
        res.status(400).json({ error: 'Missing required article fields (title, slug, description, content).' });
        return;
    }
    try {
        const compiler = new compiler_1.HtmlCompilerService();
        const publisher = new publisher_1.PublisherService();
        const db = admin.firestore();
        const compiled = await compiler.compileArticle(input);
        const filePath = await publisher.publishArticleHtml(compiled.slug, compiled.html);
        const articleDoc = {
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
        const allArticles = allArticlesSnap.docs.map(d => d.data());
        const allTopicsSnap = await db.collection('seo_topics').get();
        const allTopics = allTopicsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const allAuthorsSnap = await db.collection('seo_authors').get();
        const allAuthors = allAuthorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const hubHtml = compiler.compileBlogHub(allArticles, allTopics);
        await publisher.publishBlogHubHtml(hubHtml);
        await publisher.regenerateSitemap(allArticles, allAuthors, allTopics);
        await publisher.updateLlmsTxt(allArticles);
        res.status(200).json({
            success: true,
            slug: compiled.slug,
            url: `${config_1.CONFIG.siteUrl}/blog/${compiled.slug}/`,
            filePath
        });
    }
    catch (err) {
        console.error('[publishArticleHttp Error]', err);
        res.status(500).json({ error: err.message });
    }
});
/**
 * Callable Function for FlutterFlow UI: Trigger an autonomous batch run on-demand
 */
exports.triggerAutopilotRun = (0, https_1.onCall)({
    region: config_1.CONFIG.region,
    secrets: [config_1.openRouterApiKey, config_1.falApiKey, config_1.pikaApiKey],
    memory: '1GiB',
    timeoutSeconds: 540
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated to trigger SEO runs.');
    }
    const maxArticles = request.data?.maxArticles || 1;
    const openRouterKey = config_1.openRouterApiKey.value() || process.env.OPENROUTER_API_KEY || '';
    const falKey = config_1.falApiKey.value() || process.env.FAL_KEY || '';
    const orchestrator = new orchestrator_1.SeoOrchestrator(openRouterKey, falKey);
    const result = await orchestrator.runAutopilot(maxArticles);
    return {
        success: true,
        processedKeywords: result.processedKeywords,
        publishedArticles: result.publishedArticles,
        errors: result.errors
    };
});
/**
 * Callable Function for FlutterFlow UI: Research topic clusters and keywords
 */
exports.generateTopicClusters = (0, https_1.onCall)({
    region: config_1.CONFIG.region,
    secrets: [config_1.openRouterApiKey]
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    }
    const seedTopic = request.data?.seedTopic || 'AI filmmaking and video generation';
    const openRouterKey = config_1.openRouterApiKey.value() || process.env.OPENROUTER_API_KEY || '';
    const { OpenRouterService } = await Promise.resolve().then(() => __importStar(require('./services/openrouter')));
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
});
//# sourceMappingURL=index.js.map