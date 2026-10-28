import * as fs from 'fs';
import * as path from 'path';
import { SeoArticle, SeoAuthor, SeoTopic } from '../types/seo';
import { CONFIG } from '../config';

export class PublisherService {
  private publicDir: string;

  constructor(customPublicDir?: string) {
    this.publicDir = customPublicDir || path.resolve(__dirname, '../../../public');
  }

  /**
   * Save article HTML to public/blog/{slug}/index.html
   */
  async publishArticleHtml(slug: string, htmlContent: string): Promise<string> {
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
  async publishBlogHubHtml(htmlContent: string): Promise<string> {
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
  async publishAuthorHtml(slug: string, htmlContent: string): Promise<string> {
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
  async publishAuthorsIndexHtml(htmlContent: string): Promise<string> {
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
  async publishTopicHtml(slug: string, htmlContent: string): Promise<string> {
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
  async publishTopicsIndexHtml(htmlContent: string): Promise<string> {
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
  async regenerateSitemap(
    articles: SeoArticle[],
    authors: SeoAuthor[] = [],
    topics: SeoTopic[] = []
  ): Promise<void> {
    const sitemapPath = path.join(this.publicDir, 'sitemap.xml');
    const today = new Date().toISOString().split('T')[0];

    // Core static landing pages
    const baseUrls = [
      { loc: `${CONFIG.siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${CONFIG.siteUrl}/pricing.html`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${CONFIG.siteUrl}/imageGenerator.html`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${CONFIG.siteUrl}/videoGenerator.html`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${CONFIG.siteUrl}/audioGenerator.html`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${CONFIG.siteUrl}/mobile.html`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${CONFIG.siteUrl}/mobile-pricing.html`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${CONFIG.siteUrl}/privacy-policy.html`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${CONFIG.siteUrl}/terms-conditions.html`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${CONFIG.siteUrl}/blog/`, changefreq: 'daily', priority: '0.9', lastmod: today },
      { loc: `${CONFIG.siteUrl}/authors/`, changefreq: 'weekly', priority: '0.7', lastmod: today },
      { loc: `${CONFIG.siteUrl}/topics/`, changefreq: 'weekly', priority: '0.7', lastmod: today }
    ];

    const urlEntries: string[] = [];

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
      if (article.status !== 'published') continue;
      const lastmod = (article.updatedAt || article.publishedAt || today).split('T')[0];
      urlEntries.push(`  <url>
    <loc>${CONFIG.siteUrl}/blog/${article.slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }

    // 3. Add author pages dynamically
    for (const author of authors) {
      urlEntries.push(`  <url>
    <loc>${CONFIG.siteUrl}/authors/${author.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }

    // 4. Add topic cluster pages dynamically
    for (const topic of topics) {
      urlEntries.push(`  <url>
    <loc>${CONFIG.siteUrl}/topics/${topic.slug}/</loc>
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
  async regenerateRobotsTxt(): Promise<void> {
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
  async updateLlmsTxt(articles: SeoArticle[]): Promise<void> {
    const llmsPath = path.join(this.publicDir, 'llms.txt');

    const publishedArticles = articles.filter(a => a.status === 'published');
    const articlesListing = publishedArticles
      .map(a => `- [${a.title}](${CONFIG.siteUrl}/blog/${a.slug}/): ${a.metaDescription}`)
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
