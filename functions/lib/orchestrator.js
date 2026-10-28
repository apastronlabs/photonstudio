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
exports.SeoOrchestrator = void 0;
const admin = __importStar(require("firebase-admin"));
const openrouter_1 = require("./services/openrouter");
const fal_1 = require("./services/fal");
const compiler_1 = require("./services/compiler");
const publisher_1 = require("./services/publisher");
const config_1 = require("./config");
class SeoOrchestrator {
    db;
    openRouter;
    fal;
    compiler;
    publisher;
    constructor(openRouterKey, falKey, customPublicDir) {
        this.db = admin.firestore();
        this.openRouter = new openrouter_1.OpenRouterService(openRouterKey);
        this.fal = new fal_1.FalService(falKey);
        this.compiler = new compiler_1.HtmlCompilerService();
        this.publisher = new publisher_1.PublisherService(customPublicDir);
    }
    /**
     * Log an event into Firestore /seo_logs/
     */
    async log(event, status, message, details) {
        try {
            await this.db.collection('seo_logs').add({
                event,
                status,
                message,
                details: details || null,
                timestamp: new Date().toISOString()
            });
        }
        catch (e) {
            console.error(`[SeoLog Error] ${event}: ${message}`, e);
        }
    }
    /**
     * Retrieve or initialize default author (Varun Kuntoor / Photon Studio Editorial)
     */
    async getOrCreateDefaultAuthor() {
        const authorRef = this.db.collection('seo_authors').doc('varun-kuntoor');
        const doc = await authorRef.get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        const defaultAuthor = {
            id: 'varun-kuntoor',
            slug: 'varun-kuntoor',
            name: 'Varun Kuntoor',
            role: 'Founder & CEO, Photon Studio',
            bio: 'Filmmaker, technologist, and founder of Photon Studio (Apastron Labs). Specializing in AI-assisted cinematography, multi-model workflows, and the future of visual media.',
            socialLinks: {
                twitter: 'https://x.com/photonstudioai',
                youtube: 'https://www.youtube.com/@photonstudio-ai'
            },
            credentials: ['CEO of Apastron Labs', 'AI Cinematography Pioneer']
        };
        await authorRef.set(defaultAuthor);
        return defaultAuthor;
    }
    /**
     * Run the autonomous SEO engine
     */
    async runAutopilot(maxArticles = 1) {
        const result = {
            processedKeywords: [],
            publishedArticles: [],
            errors: []
        };
        await this.log('AutopilotRun', 'info', `Starting autonomous SEO run. Max articles: ${maxArticles}`);
        try {
            // 1. Check for pending briefs or queued keywords
            let keywordSnapshot = await this.db.collection('seo_keywords')
                .where('status', '==', 'discovered')
                .limit(maxArticles)
                .get();
            // If no keywords discovered, generate fresh topic clusters and keywords
            if (keywordSnapshot.empty) {
                await this.log('AutopilotRun', 'info', 'No discovered keywords in queue. Researching fresh clusters...');
                const research = await this.openRouter.discoverKeywordsAndClusters('AI video generation filmmaking creative workflows');
                // Save topics
                for (const t of research.topics) {
                    await this.db.collection('seo_topics').doc(t.slug).set({
                        ...t,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                }
                // Save keywords
                for (const k of research.keywords) {
                    const kwDoc = this.db.collection('seo_keywords').doc();
                    await kwDoc.set({
                        id: kwDoc.id,
                        keyword: k.keyword,
                        searchIntent: k.searchIntent,
                        difficulty: k.difficulty,
                        clusterName: k.clusterName,
                        status: 'discovered',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
                keywordSnapshot = await this.db.collection('seo_keywords')
                    .where('status', '==', 'discovered')
                    .limit(maxArticles)
                    .get();
            }
            const author = await this.getOrCreateDefaultAuthor();
            // 2. Process each keyword idempotently
            for (const doc of keywordSnapshot.docs) {
                const keywordData = doc.data();
                result.processedKeywords.push(keywordData.keyword);
                try {
                    await this.log('ArticlePipeline', 'info', `Processing keyword: "${keywordData.keyword}"`);
                    // Fetch topic or assign default
                    let topic = {
                        id: 'ai-filmmaking',
                        slug: 'ai-filmmaking',
                        name: 'AI Filmmaking & Video',
                        description: 'Advanced techniques, prompt workflows, and camera controls for modern video creators.',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    if (keywordData.topicId) {
                        const topicDoc = await this.db.collection('seo_topics').doc(keywordData.topicId).get();
                        if (topicDoc.exists) {
                            topic = { id: topicDoc.id, ...topicDoc.data() };
                        }
                    }
                    // Fetch existing article titles for internal link suggestions and deduplication
                    const existingArticlesSnap = await this.db.collection('seo_articles').limit(20).get();
                    const existingTitles = existingArticlesSnap.docs.map(d => d.data().title);
                    const availableLinks = existingArticlesSnap.docs.map(d => {
                        const art = d.data();
                        return { title: art.title, url: `${config_1.CONFIG.siteUrl}/blog/${art.slug}` };
                    });
                    // Generate Brief
                    const brief = await this.openRouter.generateContentBrief(keywordData.keyword, topic, existingTitles);
                    // Write Draft
                    const draft = await this.openRouter.writeArticleDraft(brief, author, availableLinks);
                    // Fact Check and Refine
                    const check = await this.openRouter.factCheckAndRefine(draft.title, draft.contentMarkdown);
                    const finalMarkdown = check.isApproved ? check.refinedMarkdown : draft.contentMarkdown;
                    // Generate Visual Asset via fal.ai
                    const image = await this.fal.generateImage(draft.imagePrompt || keywordData.keyword);
                    // Build Article Object
                    const readingTime = this.compiler.calculateReadingTime(finalMarkdown);
                    const now = new Date().toISOString();
                    const article = {
                        id: draft.slug,
                        slug: draft.slug,
                        title: draft.title,
                        metaDescription: draft.metaDescription,
                        canonicalUrl: `${config_1.CONFIG.siteUrl}/blog/${draft.slug}`,
                        primaryKeyword: keywordData.keyword,
                        secondaryKeywords: [keywordData.clusterName || 'Photon Studio'],
                        searchIntent: keywordData.searchIntent,
                        topicId: topic.id,
                        topicName: topic.name,
                        authorId: author.id,
                        author,
                        contentMarkdown: finalMarkdown,
                        featuredImage: {
                            url: image.url,
                            alt: draft.title,
                            width: image.width,
                            height: image.height
                        },
                        readingTimeMinutes: readingTime,
                        factCheckScore: check.score,
                        factCheckNotes: check.critique,
                        status: 'published',
                        publishedAt: now,
                        createdAt: now,
                        updatedAt: now
                    };
                    // Compile HTML
                    const compiled = await this.compiler.compileArticle({
                        title: article.title,
                        subtitle: article.subtitle,
                        slug: article.slug,
                        description: article.metaDescription,
                        author,
                        topic,
                        content: finalMarkdown,
                        heroImage: article.featuredImage,
                        publishedAt: article.publishedAt
                    });
                    const compiledArticleHtml = compiled.html;
                    article.contentHtml = compiledArticleHtml;
                    // Save to Firestore
                    await this.db.collection('seo_articles').doc(article.slug).set(article);
                    // Update keyword status
                    await doc.ref.update({
                        status: 'published',
                        articleId: article.slug,
                        updatedAt: now
                    });
                    // Publish static files
                    await this.publisher.publishArticleHtml(article.slug, compiledArticleHtml);
                    result.publishedArticles.push(article.slug);
                    await this.log('ArticlePipeline', 'success', `Successfully generated & published: "${article.title}" (${article.slug})`);
                }
                catch (itemError) {
                    const errMsg = `Failed processing keyword "${keywordData.keyword}": ${itemError.message}`;
                    console.error(errMsg, itemError);
                    result.errors.push(errMsg);
                    await this.log('ArticlePipeline', 'error', errMsg, itemError.stack);
                }
            }
            // Recompile Hub and update Sitemap & LLMs.txt
            const allPublishedSnap = await this.db.collection('seo_articles')
                .where('status', '==', 'published')
                .get();
            const allPublished = allPublishedSnap.docs.map(d => d.data());
            const allTopicsSnap = await this.db.collection('seo_topics').get();
            const allTopics = allTopicsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const hubHtml = this.compiler.compileBlogHub(allPublished, allTopics);
            await this.publisher.publishBlogHubHtml(hubHtml);
            await this.publisher.regenerateSitemap(allPublished, [], allTopics);
            await this.publisher.updateLlmsTxt(allPublished);
            await this.log('AutopilotRun', 'success', `Autopilot run complete. Published: ${result.publishedArticles.length}, Errors: ${result.errors.length}`);
        }
        catch (runError) {
            console.error('Autopilot run failed:', runError);
            result.errors.push(runError.message);
            await this.log('AutopilotRun', 'error', `Fatal error during autopilot run: ${runError.message}`, runError.stack);
        }
        return result;
    }
}
exports.SeoOrchestrator = SeoOrchestrator;
//# sourceMappingURL=orchestrator.js.map