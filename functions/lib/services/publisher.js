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
exports.PublisherService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../config");
class PublisherService {
    publicDir;
    constructor(customPublicDir) {
        this.publicDir = customPublicDir || path.resolve(__dirname, '../../../public');
    }
    /**
     * Save article HTML to public/blog/{slug}/index.html
     */
    async publishArticleHtml(slug, htmlContent) {
        const articleDir = path.join(this.publicDir, 'blog', slug);
        if (!fs.existsSync(articleDir)) {
            fs.mkdirSync(articleDir, { recursive: true });
        }
        const filePath = path.join(articleDir, 'index.html');
        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        return filePath;
    }
    /**
     * Save blog hub HTML to public/blog/index.html
     */
    async publishBlogHubHtml(htmlContent) {
        const blogDir = path.join(this.publicDir, 'blog');
        if (!fs.existsSync(blogDir)) {
            fs.mkdirSync(blogDir, { recursive: true });
        }
        const filePath = path.join(blogDir, 'index.html');
        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        return filePath;
    }
    /**
     * Save author profile HTML to public/authors/{slug}/index.html
     */
    async publishAuthorHtml(slug, htmlContent) {
        const dir = path.join(this.publicDir, 'authors', slug);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, 'index.html');
        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        return filePath;
    }
    /**
     * Save authors index HTML to public/authors/index.html
     */
    async publishAuthorsIndexHtml(htmlContent) {
        const dir = path.join(this.publicDir, 'authors');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, 'index.html');
        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        return filePath;
    }
    /**
     * Save topic hub HTML to public/topics/{slug}/index.html
     */
    async publishTopicHtml(slug, htmlContent) {
        const dir = path.join(this.publicDir, 'topics', slug);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, 'index.html');
        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        return filePath;
    }
    /**
     * Save topics index HTML to public/topics/index.html
     */
    async publishTopicsIndexHtml(htmlContent) {
        const dir = path.join(this.publicDir, 'topics');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, 'index.html');
        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        return filePath;
    }
    /**
     * Completely regenerate public/sitemap.xml dynamically from published content
     * Never hardcoded!
     */
    async regenerateSitemap(articles, authors = [], topics = []) {
        const sitemapPath = path.join(this.publicDir, 'sitemap.xml');
        const today = new Date().toISOString().split('T')[0];
        // Core static landing pages
        const baseUrls = [
            { loc: `${config_1.CONFIG.siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
            { loc: `${config_1.CONFIG.siteUrl}/pricing.html`, changefreq: 'weekly', priority: '0.9' },
            { loc: `${config_1.CONFIG.siteUrl}/imageGenerator.html`, changefreq: 'weekly', priority: '0.9' },
            { loc: `${config_1.CONFIG.siteUrl}/videoGenerator.html`, changefreq: 'weekly', priority: '0.9' },
            { loc: `${config_1.CONFIG.siteUrl}/audioGenerator.html`, changefreq: 'weekly', priority: '0.9' },
            { loc: `${config_1.CONFIG.siteUrl}/mobile.html`, changefreq: 'weekly', priority: '0.7' },
            { loc: `${config_1.CONFIG.siteUrl}/mobile-pricing.html`, changefreq: 'weekly', priority: '0.7' },
            { loc: `${config_1.CONFIG.siteUrl}/privacy-policy.html`, changefreq: 'monthly', priority: '0.5' },
            { loc: `${config_1.CONFIG.siteUrl}/terms-conditions.html`, changefreq: 'monthly', priority: '0.5' },
            { loc: `${config_1.CONFIG.siteUrl}/blog/`, changefreq: 'daily', priority: '0.9', lastmod: today },
            { loc: `${config_1.CONFIG.siteUrl}/authors/`, changefreq: 'weekly', priority: '0.7', lastmod: today },
            { loc: `${config_1.CONFIG.siteUrl}/topics/`, changefreq: 'weekly', priority: '0.7', lastmod: today }
        ];
        const urlEntries = [];
        // 1. Add base URLs
        for (const b of baseUrls) {
            urlEntries.push(`  <url>
    <loc>${b.loc}</loc>
    ${b.lastmod ? `<lastmod>${b.lastmod}</lastmod>\n    ` : ''}<changefreq>${b.changefreq}</changefreq>
    <priority>${b.priority}</priority>
  </url>`);
        }
        // 2. Add published articles dynamically
        for (const article of articles) {
            if (article.status !== 'published')
                continue;
            const lastmod = (article.updatedAt || article.publishedAt || today).split('T')[0];
            urlEntries.push(`  <url>
    <loc>${config_1.CONFIG.siteUrl}/blog/${article.slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
        }
        // 3. Add author pages dynamically
        for (const author of authors) {
            urlEntries.push(`  <url>
    <loc>${config_1.CONFIG.siteUrl}/authors/${author.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
        }
        // 4. Add topic cluster pages dynamically
        for (const topic of topics) {
            urlEntries.push(`  <url>
    <loc>${config_1.CONFIG.siteUrl}/topics/${topic.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;
        fs.writeFileSync(sitemapPath, xml, 'utf-8');
    }
    /**
     * Regenerate public/robots.txt
     */
    async regenerateRobotsTxt() {
        const robotsPath = path.join(this.publicDir, 'robots.txt');
        const content = `User-agent: *
Allow: /

# Allow explicit access to Blog & Hubs
Allow: /blog/
Allow: /authors/
Allow: /topics/

# Allow explicit access to Generator pages
Allow: /imageGenerator.html
Allow: /videoGenerator.html
Allow: /audioGenerator.html

# Allow explicit access to all content JSON files
Allow: /js/carousel-data.json
Allow: /js/colors.json
Allow: /js/community-content.json
Allow: /js/faq-content.json
Allow: /js/hero-mobile.json
Allow: /js/marketing-content.json
Allow: /js/model-icons.json
Allow: /js/nav-data.json
Allow: /js/pricing-data.json
Allow: /js/pricing-faq-content.json
Allow: /js/reviews-content.json
Allow: /js/sections-data.json
Allow: /js/site-config.json
Allow: /js/trust-logos.json

# Allow explicit access to AI/Agent context files
Allow: /llms.txt

Sitemap: https://photonstudio.ai/sitemap.xml
`;
        fs.writeFileSync(robotsPath, content, 'utf-8');
    }
    /**
     * Update public/llms.txt for AI Search Engines (ChatGPT Search, Perplexity, etc.)
     */
    async updateLlmsTxt(articles) {
        const llmsPath = path.join(this.publicDir, 'llms.txt');
        const publishedArticles = articles.filter(a => a.status === 'published');
        const articlesListing = publishedArticles
            .map(a => `- [${a.title}](${config_1.CONFIG.siteUrl}/blog/${a.slug}/): ${a.metaDescription}`)
            .join('\n');
        const content = `# Photon Studio
> The Ultimate AI Creative Suite for Filmmakers, Creators, and Marketing Studios.
> Website: https://photonstudio.ai
> Application: https://app.photonstudio.ai

## Core Platform Overview
Photon Studio provides unified AI image and AI video generation with cutting-edge foundation models and camera controls:
- **One Canvas Workflow**: Visual moodboards, real-time node connections, multi-model creative canvas.
- **AI Cinema Studio**: Cinematic camera angles, lens controls, prompt choreography.
- **AI Marketing Studio**: Automated ad variants, e-commerce re-character sheets, product photography.
- **Integrated Models**: Higgsfield AI, Nano Banana Pro, Seedance 2.0 (4K), Veo 3.1, ChatGPT Image 2.
- **Creative Tools**: InPaint, Relighting, Upscaling, Character consistency tools.

## Key Product URLs
- AI Image Generator: https://photonstudio.ai/imageGenerator
- AI Video Generator: https://photonstudio.ai/videoGenerator
- AI Audio Generator: https://photonstudio.ai/audioGenerator
- Pricing & Studio Plans: https://photonstudio.ai/pricing
- Creative Blog & Guides: https://photonstudio.ai/blog/

## Authoritative Creative Guides & Tutorials
${articlesListing || '- Comprehensive tutorials and model benchmarks are published weekly at https://photonstudio.ai/blog/'}
`;
        fs.writeFileSync(llmsPath, content, 'utf-8');
    }
}
exports.PublisherService = PublisherService;
//# sourceMappingURL=publisher.js.map