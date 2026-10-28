"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlCompilerService = void 0;
const marked_1 = require("marked");
const config_1 = require("../config");
class HtmlCompilerService {
    /**
     * Calculate reading time in minutes
     */
    calculateReadingTime(text) {
        const words = text.trim().split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 220));
    }
    /**
     * Convert structured content blocks or markdown into semantic HTML and Table of Contents
     */
    async renderContentAndToc(content) {
        const toc = [];
        let rawText = '';
        if (typeof content === 'string') {
            // Process markdown string
            rawText = content;
            const lines = content.split('\n');
            const processedLines = [];
            for (const line of lines) {
                const match = line.match(/^(#{2,3})\s+(.+)$/);
                if (match) {
                    const level = match[1].length;
                    const text = match[2].trim().replace(/\*|_/g, '');
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    toc.push({ id, text, level });
                    processedLines.push(`<h${level} id="${id}">${text}</h${level}>`);
                }
                else {
                    processedLines.push(line);
                }
            }
            const html = await marked_1.marked.parse(processedLines.join('\n'));
            return { html, toc, rawText };
        }
        // Process ContentBlock[]
        const htmlParts = [];
        for (const block of content) {
            switch (block.type) {
                case 'heading': {
                    const id = block.id || block.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    toc.push({ id, text: block.text, level: block.level });
                    htmlParts.push(`<h${block.level} id="${id}">${block.text}</h${block.level}>`);
                    rawText += ` ${block.text}`;
                    break;
                }
                case 'paragraph': {
                    htmlParts.push(`<p>${block.text}</p>`);
                    rawText += ` ${block.text}`;
                    break;
                }
                case 'markdown': {
                    const rendered = await marked_1.marked.parse(block.markdown);
                    htmlParts.push(rendered);
                    rawText += ` ${block.markdown}`;
                    break;
                }
                case 'image': {
                    htmlParts.push(`
            <figure class="blog-image-wrap">
              <img src="${block.url}" alt="${block.alt || ''}" width="${block.width || 1200}" height="${block.height || 675}" loading="lazy">
              ${block.caption ? `<figcaption class="blog-media-caption">${block.caption}</figcaption>` : ''}
            </figure>
          `);
                    break;
                }
                case 'video': {
                    htmlParts.push(`
            <figure class="blog-video-wrap">
              <video src="${block.url}" ${block.poster ? `poster="${block.poster}"` : ''} controls playsinline preload="metadata" ${block.autoplay ? 'autoplay' : ''} ${block.loop ? 'loop' : ''} ${block.muted ? 'muted' : ''}></video>
              ${block.caption ? `<figcaption class="blog-media-caption">${block.caption}</figcaption>` : ''}
            </figure>
          `);
                    break;
                }
                case 'table': {
                    const headersHtml = block.headers.map(h => `<th>${h}</th>`).join('');
                    const rowsHtml = block.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
                    htmlParts.push(`
            <div class="blog-table-wrap">
              <table class="blog-table">
                <thead><tr>${headersHtml}</tr></thead>
                <tbody>${rowsHtml}</tbody>
              </table>
              ${block.caption ? `<div class="blog-media-caption">${block.caption}</div>` : ''}
            </div>
          `);
                    break;
                }
                case 'blockquote': {
                    htmlParts.push(`
            <blockquote class="blog-blockquote">
              <p>"${block.quote}"</p>
              ${(block.author || block.cite) ? `<cite class="blog-blockquote-cite">— ${block.author || ''} ${block.cite ? `<span>(${block.cite})</span>` : ''}</cite>` : ''}
            </blockquote>
          `);
                    rawText += ` ${block.quote}`;
                    break;
                }
                case 'citations': {
                    const itemsHtml = block.items.map(item => `<li><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.text}</a></li>`).join('');
                    htmlParts.push(`
            <div class="blog-citations">
              <h4>Citations & References</h4>
              <ul class="blog-citations-list">${itemsHtml}</ul>
            </div>
          `);
                    break;
                }
                case 'callout': {
                    htmlParts.push(`
            <div class="blog-callout blog-callout--${block.variant || 'note'}">
              ${block.title ? `<div class="blog-callout__title">${block.title}</div>` : ''}
              <div class="blog-callout__content">${block.content}</div>
            </div>
          `);
                    rawText += ` ${block.content}`;
                    break;
                }
                case 'code': {
                    const promptId = `prompt_${Math.random().toString(36).substring(2, 9)}`;
                    htmlParts.push(`
            <div class="prompt-box">
              <div class="prompt-box__header">
                <div class="prompt-box__title">
                  <span class="prompt-box__badge">PROMPT REFERENCE</span>
                  <span>${block.caption || 'Cinematic Prompt Setup'}</span>
                </div>
                <button class="btn-3d-copy" data-prompt-target="${promptId}">
                  <span class="material-icons" style="font-size:16px;">content_copy</span>
                  <span>Copy Prompt</span>
                </button>
              </div>
              <div class="prompt-box__content">
                <pre class="prompt-box__code" id="${promptId}">${block.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              </div>
            </div>
            ${block.caption ? `<div class="blog-media-caption">${block.caption}</div>` : ''}
          `);
                    break;
                }
            }
        }
        return {
            html: htmlParts.join('\n'),
            toc,
            rawText
        };
    }
    /**
     * Generate JSON-LD Schema.org graph
     */
    generateArticleJsonLd(article, author, customSchema) {
        if (customSchema)
            return customSchema;
        const canonical = `${config_1.CONFIG.siteUrl}/blog/${article.slug}`;
        return {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'WebSite',
                    '@id': `${config_1.CONFIG.siteUrl}/#website`,
                    'url': `${config_1.CONFIG.siteUrl}/`,
                    'name': config_1.CONFIG.siteName,
                    'publisher': {
                        '@id': `${config_1.CONFIG.siteUrl}/#organization`
                    }
                },
                {
                    '@type': 'Organization',
                    '@id': `${config_1.CONFIG.siteUrl}/#organization`,
                    'name': config_1.CONFIG.publisherOrganization,
                    'alternateName': config_1.CONFIG.siteName,
                    'url': config_1.CONFIG.siteUrl,
                    'logo': `${config_1.CONFIG.siteUrl}/assets/Logo%20-%20Favicon.png`
                },
                {
                    '@type': 'Person',
                    '@id': `${config_1.CONFIG.siteUrl}/authors/${author.slug}/#author`,
                    'name': author.name,
                    'jobTitle': author.role,
                    'description': author.bio,
                    'url': `${config_1.CONFIG.siteUrl}/authors/${author.slug}/`
                },
                {
                    '@type': 'BreadcrumbList',
                    '@id': `${canonical}/#breadcrumb`,
                    'itemListElement': [
                        {
                            '@type': 'ListItem',
                            'position': 1,
                            'name': 'Home',
                            'item': `${config_1.CONFIG.siteUrl}/`
                        },
                        {
                            '@type': 'ListItem',
                            'position': 2,
                            'name': 'Blog',
                            'item': `${config_1.CONFIG.siteUrl}/blog/`
                        },
                        {
                            '@type': 'ListItem',
                            'position': 3,
                            'name': article.title,
                            'item': `${canonical}/`
                        }
                    ]
                },
                {
                    '@type': 'Article',
                    '@id': `${canonical}/#article`,
                    'isPartOf': {
                        '@id': `${config_1.CONFIG.siteUrl}/#website`
                    },
                    'headline': article.title,
                    'description': article.description,
                    'mainEntityOfPage': `${canonical}/`,
                    'datePublished': article.publishedAt || new Date().toISOString(),
                    'dateModified': article.updatedAt || article.publishedAt || new Date().toISOString(),
                    'author': {
                        '@id': `${config_1.CONFIG.siteUrl}/authors/${author.slug}/#author`
                    },
                    'publisher': {
                        '@id': `${config_1.CONFIG.siteUrl}/#organization`
                    },
                    'image': article.heroImage || `${config_1.CONFIG.siteUrl}/assets/Logo%20-%20Favicon.png`,
                    'keywords': article.primaryKeyword || 'Photon Studio'
                }
            ]
        };
    }
    /**
     * Normalize author input
     */
    normalizeAuthor(authorInput) {
        if (typeof authorInput === 'object' && authorInput.name) {
            return {
                id: authorInput.id || authorInput.slug || authorInput.name.toLowerCase().replace(/\s+/g, '-'),
                slug: authorInput.slug || authorInput.name.toLowerCase().replace(/\s+/g, '-'),
                name: authorInput.name,
                role: authorInput.role || 'Contributor, Photon Studio',
                bio: authorInput.bio || 'AI filmmaker, visual artist, and contributor to Photon Studio.',
                socialLinks: authorInput.socialLinks,
                credentials: authorInput.credentials
            };
        }
        const name = typeof authorInput === 'string' && authorInput ? authorInput : 'Varun Kuntoor';
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return {
            id: slug,
            slug,
            name,
            role: name.includes('Varun') ? 'Founder & CEO, Photon Studio' : 'Contributing Creator, Photon Studio',
            bio: 'Filmmaker and technologist specializing in AI cinematography, multi-model workflows, and next-generation video creation at Photon Studio.'
        };
    }
    /**
     * Normalize topic input
     */
    normalizeTopic(topicInput) {
        if (!topicInput)
            return undefined;
        if (typeof topicInput === 'object')
            return topicInput;
        return {
            id: topicInput.toLowerCase().replace(/\s+/g, '-'),
            slug: topicInput.toLowerCase().replace(/\s+/g, '-'),
            name: topicInput,
            description: `Guides, tutorials, and insights about ${topicInput} on Photon Studio.`
        };
    }
    /**
     * Normalize hero image
     */
    normalizeHeroImage(heroInput) {
        if (!heroInput) {
            return {
                url: 'https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg',
                alt: 'Photon Studio AI Creative Platform',
                width: 1200,
                height: 675
            };
        }
        if (typeof heroInput === 'string') {
            return {
                url: heroInput,
                alt: 'Photon Studio Visual',
                width: 1200,
                height: 675
            };
        }
        return {
            url: heroInput.url,
            alt: heroInput.alt || 'Photon Studio Visual',
            caption: heroInput.caption,
            width: heroInput.width || 1200,
            height: heroInput.height || 675
        };
    }
    /**
     * Compile a complete, responsive Article HTML from structured data
     */
    async compileArticle(input) {
        const author = this.normalizeAuthor(input.author);
        const topic = this.normalizeTopic(input.topic);
        const heroImage = this.normalizeHeroImage(input.heroImage);
        const slug = input.slug.toLowerCase().replace(/[^\w-]/g, '');
        const canonicalUrl = input.canonicalUrl || `${config_1.CONFIG.siteUrl}/blog/${slug}`;
        const publishedAt = input.publishedAt || new Date().toISOString();
        const updatedAt = input.updatedAt || publishedAt;
        const { html: bodyHtml, toc, rawText } = await this.renderContentAndToc(input.content);
        const readingTime = this.calculateReadingTime(rawText);
        const jsonLd = this.generateArticleJsonLd({
            title: input.title,
            slug,
            description: input.description,
            publishedAt,
            updatedAt,
            heroImage: heroImage.url,
            primaryKeyword: input.primaryKeyword
        }, author, input.schema);
        // Citations block if provided in structured input
        let citationsHtml = '';
        if (input.citations && input.citations.length > 0) {
            citationsHtml = `
        <div class="blog-citations">
          <h4>Citations & References</h4>
          <ul class="blog-citations-list">
            ${input.citations.map(c => `<li><a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.text}</a></li>`).join('')}
          </ul>
        </div>
      `;
        }
        // Related articles block
        let relatedHtml = '';
        if (input.relatedArticles && input.relatedArticles.length > 0) {
            relatedHtml = `
        <section class="blog-related-section">
          <h3>Related Creative Guides</h3>
          <div class="blog-related-grid">
            ${input.relatedArticles.map(r => `
              <a href="/blog/${r.slug}" class="blog-related-card">
                ${r.heroImage ? `<img src="${r.heroImage}" alt="${r.title}" loading="lazy" width="300" height="160">` : ''}
                <div class="blog-related-card__content">
                  <h4 class="blog-related-card__title">${r.title}</h4>
                  <div class="blog-related-card__meta">${r.readingTimeMinutes || 5} min read</div>
                </div>
              </a>
            `).join('')}
          </div>
        </section>
      `;
        }
        // Table of contents
        const tocHtml = toc.length > 0
            ? `<aside class="blog-toc">
          <div class="blog-toc__title">Table of Contents</div>
          <ul class="blog-toc__list">
            ${toc.map(item => `<li class="blog-toc__item blog-toc__item--h${item.level}"><a href="#${item.id}">${item.text}</a></li>`).join('\n')}
          </ul>
        </aside>`
            : '';
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9BK0WHBZ1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-V9BK0WHBZ1');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.title} | Photon Studio</title>
  <meta name="description" content="${input.description}">
  ${input.primaryKeyword ? `<meta name="keywords" content="${input.primaryKeyword}${input.secondaryKeywords ? `, ${input.secondaryKeywords.join(', ')}` : ''}">` : ''}
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/png" href="../../assets/Logo - Favicon.png">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${input.title}">
  <meta property="og:description" content="${input.description}">
  <meta property="og:image" content="${heroImage.url}">
  <meta property="article:published_time" content="${publishedAt}">
  <meta property="article:modified_time" content="${updatedAt}">
  <meta property="article:author" content="${author.name}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${input.title}">
  <meta name="twitter:description" content="${input.description}">
  <meta name="twitter:image" content="${heroImage.url}">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <!-- Scoped Blog Stylesheet -->
  <link rel="stylesheet" href="../../css/blog.css?v=1.0.1">

  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body class="blog-body">
  <!-- Header / Navigation -->
  <header class="blog-nav">
    <div class="blog-nav__inner">
      <a href="/" class="blog-nav__brand">
        <img src="../../assets/Logo - Favicon.png" alt="Photon Studio" width="32" height="32">
        <span>PHOTON STUDIO</span>
      </a>
      <nav class="blog-nav__links">
        <a href="/" class="blog-nav__link">Home</a>
        <a href="/imageGenerator" class="blog-nav__link">Image Gen</a>
        <a href="/videoGenerator" class="blog-nav__link">Video Gen</a>
        <a href="/pricing" class="blog-nav__link">Pricing</a>
        <a href="/blog" class="blog-nav__link active">Blog</a>
        <a href="https://app.photonstudio.ai" class="btn-blog-primary">Launch App</a>
      </nav>
    </div>
  </header>

  <!-- Main Article Layout -->
  <main class="blog-article-container">
    <nav class="blog-breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> / <a href="/blog">Blog</a> ${topic ? `/ <a href="/topics/${topic.slug}">${topic.name}</a>` : ''} / <span>${input.title}</span>
    </nav>

    <header class="blog-header">
      <div class="blog-meta-top">
        ${topic ? `<a href="/topics/${topic.slug}" class="blog-topic-pill">${topic.name}</a>` : ''}
        <span class="blog-reading-time"><span class="material-icons" style="font-size:14px;vertical-align:middle;">schedule</span> ${readingTime} min read</span>
      </div>
      <h1 class="blog-title">${input.title}</h1>
      ${input.subtitle ? `<p class="blog-dek">${input.subtitle}</p>` : ''}
      <div class="blog-author-meta">
        <a href="/authors/${author.slug}" class="blog-author-info">
          <div class="blog-author-avatar-ph">${author.name.charAt(0)}</div>
          <div>
            <div class="blog-author-name">${author.name}</div>
            <div class="blog-author-role">${author.role}</div>
          </div>
        </a>
      </div>
    </header>

    <div class="blog-hero-image-wrap">
      <img src="${heroImage.url}" alt="${heroImage.alt}" class="blog-hero-image" width="${heroImage.width}" height="${heroImage.height}" loading="eager">
      ${heroImage.caption ? `<div class="blog-media-caption">${heroImage.caption}</div>` : ''}
    </div>

    <div class="blog-content-layout">
      ${tocHtml}
      <article class="blog-article-content">
        ${bodyHtml}
      </article>
    </div>

    ${citationsHtml}

    <!-- Call to Action Banner -->
    <section class="blog-cta-banner">
      <div class="blog-cta-banner__content">
        <h2>Experience Next-Generation AI Video & Imagery</h2>
        <p>Harness Higgsfield AI, Nano Banana Pro, Seedance 2.0 4K, and One-Canvas workflows directly inside Photon Studio.</p>
        <div class="blog-cta-banner__buttons">
          <a href="https://app.photonstudio.ai" class="btn-cta-gold">Start Creating Free</a>
          <a href="/pricing" class="btn-cta-secondary">View Studio Plans</a>
        </div>
      </div>
    </section>

    <!-- Author Bio Box -->
    <section class="blog-author-card">
      <div class="blog-author-avatar-ph large">${author.name.charAt(0)}</div>
      <div class="blog-author-card__bio">
        <h3>Written by <a href="/authors/${author.slug}">${author.name}</a></h3>
        <p class="role">${author.role}</p>
        <p>${author.bio}</p>
      </div>
    </section>

    ${relatedHtml}
  </main>

  <!-- Footer -->
  <footer class="blog-footer">
    <div class="blog-footer__inner">
      <div class="blog-footer__brand">
        <p class="tagline">THE ULTIMATE AI-POWERED CAMERA CONTROL FOR FILMMAKERS & CREATORS</p>
        <p class="copy">&copy; ${new Date().getFullYear()} Apastron Labs Pvt Ltd. All rights reserved.</p>
      </div>
      <div class="blog-footer__links">
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/blog">Blog</a>
        <a href="/authors">Authors</a>
        <a href="/topics">Topics</a>
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms-conditions">Terms & Conditions</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
        return {
            html,
            slug,
            canonicalUrl,
            readingTimeMinutes: readingTime,
            jsonLd
        };
    }
    /**
     * Compile Authors Index Page (/authors/index.html)
     */
    compileAuthorsIndex(authors) {
        const canonical = `${config_1.CONFIG.siteUrl}/authors`;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9BK0WHBZ1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-V9BK0WHBZ1');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Editorial Authors & Contributors | Photon Studio</title>
  <meta name="description" content="Meet the filmmakers, prompt directors, and creative technologists writing for Photon Studio.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="../assets/Logo - Favicon.png">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="Editorial Authors & Contributors | Photon Studio">
  <meta property="og:description" content="Meet the filmmakers, prompt directors, and creative technologists writing for Photon Studio.">
  <meta property="og:image" content="https://photonstudio.ai/assets/Logo%20-%20Favicon.png">

  <!-- Fonts & Styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="../css/blog.css?v=1.0.1">
</head>
<body class="blog-body">
  <header class="blog-nav">
    <div class="blog-nav__inner">
      <a href="/" class="blog-nav__brand">
        <img src="../assets/Logo - Favicon.png" alt="Photon Studio" width="32" height="32">
        <span>PHOTON STUDIO</span>
      </a>
      <nav class="blog-nav__links">
        <a href="/" class="blog-nav__link">Home</a>
        <a href="/pricing" class="blog-nav__link">Pricing</a>
        <a href="/blog" class="blog-nav__link">Blog</a>
        <a href="https://app.photonstudio.ai" class="btn-blog-primary">Launch App</a>
      </nav>
    </div>
  </header>

  <main class="blog-hub-container">
    <div class="blog-hub-hero">
      <div class="badge">E-E-A-T EDITORIAL TEAM</div>
      <h1>Authors & Creative Technologists</h1>
      <p>The directors, artists, and engineers behind Photon Studio's in-depth filmmaking guides.</p>
    </div>

    <div class="authors-grid">
      ${authors.map(a => `
        <a href="/authors/${a.slug}" class="author-card">
          <div class="author-profile-avatar">${a.name.charAt(0)}</div>
          <h2 style="font-family:var(--blog-font-display);font-size:22px;color:#fff;margin:0 0 6px;">${a.name}</h2>
          <div style="color:var(--blog-primary);font-size:13px;font-weight:600;margin-bottom:12px;">${a.role}</div>
          <p style="color:var(--blog-text-muted);font-size:14px;line-height:1.6;margin:0;">${a.bio}</p>
        </a>
      `).join('\n')}
    </div>
  </main>

  <footer class="blog-footer">
    <div class="blog-footer__inner">
      <div class="blog-footer__brand">
        <p class="tagline">THE ULTIMATE AI-POWERED CAMERA CONTROL FOR FILMMAKERS & CREATORS</p>
        <p class="copy">&copy; ${new Date().getFullYear()} Apastron Labs Pvt Ltd. All rights reserved.</p>
      </div>
      <div class="blog-footer__links">
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/blog">Blog</a>
        <a href="/authors">Authors</a>
        <a href="/topics">Topics</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
    }
    /**
     * Compile Author Profile Page (/authors/{slug}/index.html)
     */
    compileAuthorProfile(author, articles) {
        const canonical = `${config_1.CONFIG.siteUrl}/authors/${author.slug}`;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9BK0WHBZ1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-V9BK0WHBZ1');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${author.name} | Editorial Author | Photon Studio</title>
  <meta name="description" content="${author.bio}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="../../assets/Logo - Favicon.png">

  <!-- Open Graph -->
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${author.name} | Photon Studio">
  <meta property="og:description" content="${author.bio}">
  <meta property="og:image" content="https://photonstudio.ai/assets/Logo%20-%20Favicon.png">

  <!-- Fonts & Styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="../../css/blog.css?v=1.0.1">

  <!-- Schema.org Person JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "${author.name}",
    "jobTitle": "${author.role}",
    "description": "${author.bio}",
    "url": "${canonical}/",
    "worksFor": {
      "@type": "Organization",
      "name": "Photon Studio",
      "url": "https://photonstudio.ai"
    }
  }
  </script>
</head>
<body class="blog-body">
  <header class="blog-nav">
    <div class="blog-nav__inner">
      <a href="/" class="blog-nav__brand">
        <img src="../../assets/Logo - Favicon.png" alt="Photon Studio" width="32" height="32">
        <span>PHOTON STUDIO</span>
      </a>
      <nav class="blog-nav__links">
        <a href="/" class="blog-nav__link">Home</a>
        <a href="/pricing" class="blog-nav__link">Pricing</a>
        <a href="/blog" class="blog-nav__link">Blog</a>
        <a href="https://app.photonstudio.ai" class="btn-blog-primary">Launch App</a>
      </nav>
    </div>
  </header>

  <main class="blog-hub-container">
    <div class="author-profile-hero">
      <div class="author-profile-avatar">${author.name.charAt(0)}</div>
      <h1>${author.name}</h1>
      <div class="author-role">${author.role}</div>
      <p class="author-bio">${author.bio}</p>
    </div>

    <h2 style="font-family:var(--blog-font-display);font-size:24px;color:#fff;margin:40px 0 20px;">Articles by ${author.name} (${articles.length})</h2>

    <div class="blog-articles-grid">
      ${articles.map(a => `
        <article class="blog-card">
          <a href="/blog/${a.slug}" class="blog-card__image-link">
            <img src="${a.featuredImage?.url || a.heroImage?.url || 'https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg'}" alt="${a.title}" loading="lazy" width="400" height="225">
          </a>
          <div class="blog-card__body">
            <h3 class="blog-card__title">
              <a href="/blog/${a.slug}">${a.title}</a>
            </h3>
            <p class="blog-card__excerpt">${a.metaDescription}</p>
            <div class="blog-card__footer">
              <a href="/blog/${a.slug}" class="read-more">Read Guide <span class="material-icons" style="font-size:16px;">arrow_forward</span></a>
            </div>
          </div>
        </article>
      `).join('\n')}
    </div>
  </main>

  <footer class="blog-footer">
    <div class="blog-footer__inner">
      <div class="blog-footer__brand">
        <p class="tagline">THE ULTIMATE AI-POWERED CAMERA CONTROL FOR FILMMAKERS & CREATORS</p>
        <p class="copy">&copy; ${new Date().getFullYear()} Apastron Labs Pvt Ltd. All rights reserved.</p>
      </div>
      <div class="blog-footer__links">
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/blog">Blog</a>
        <a href="/authors">Authors</a>
        <a href="/topics">Topics</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
    }
    /**
     * Compile Topics Index Page (/topics/index.html)
     */
    compileTopicsIndex(topics) {
        const canonical = `${config_1.CONFIG.siteUrl}/topics`;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9BK0WHBZ1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-V9BK0WHBZ1');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creative AI Topics & Topic Clusters | Photon Studio</title>
  <meta name="description" content="Explore Photon Studio creative topics across AI filmmaking, model benchmarks, canvas workflows, and prompt engineering.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="../assets/Logo - Favicon.png">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="Creative AI Topics & Clusters | Photon Studio">
  <meta property="og:description" content="Explore topics across AI filmmaking, model benchmarks, and workflows.">
  <meta property="og:image" content="https://photonstudio.ai/assets/Logo%20-%20Favicon.png">

  <!-- Fonts & Styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="../css/blog.css?v=1.0.1">
</head>
<body class="blog-body">
  <header class="blog-nav">
    <div class="blog-nav__inner">
      <a href="/" class="blog-nav__brand">
        <img src="../assets/Logo - Favicon.png" alt="Photon Studio" width="32" height="32">
        <span>PHOTON STUDIO</span>
      </a>
      <nav class="blog-nav__links">
        <a href="/" class="blog-nav__link">Home</a>
        <a href="/pricing" class="blog-nav__link">Pricing</a>
        <a href="/blog" class="blog-nav__link">Blog</a>
        <a href="https://app.photonstudio.ai" class="btn-blog-primary">Launch App</a>
      </nav>
    </div>
  </header>

  <main class="blog-hub-container">
    <div class="blog-hub-hero">
      <div class="badge">TOPICAL HUBS</div>
      <h1>Creative AI Topics</h1>
      <p>Browse tutorials, guides, and model breakdowns by domain expertise.</p>
    </div>

    <div class="topics-grid">
      ${topics.map(t => `
        <a href="/topics/${t.slug}" class="topic-box">
          <h2 class="topic-box__title">${t.name}</h2>
          <p class="topic-box__desc">${t.description}</p>
          <div class="topic-box__count">Explore Topic Hub <span class="material-icons" style="font-size:14px;vertical-align:middle;">arrow_forward</span></div>
        </a>
      `).join('\n')}
    </div>
  </main>

  <footer class="blog-footer">
    <div class="blog-footer__inner">
      <div class="blog-footer__brand">
        <p class="tagline">THE ULTIMATE AI-POWERED CAMERA CONTROL FOR FILMMAKERS & CREATORS</p>
        <p class="copy">&copy; ${new Date().getFullYear()} Apastron Labs Pvt Ltd. All rights reserved.</p>
      </div>
      <div class="blog-footer__links">
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/blog">Blog</a>
        <a href="/authors">Authors</a>
        <a href="/topics">Topics</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
    }
    /**
     * Compile Topic Cluster Page (/topics/{slug}/index.html)
     */
    compileTopicCluster(topic, articles) {
        const canonical = `${config_1.CONFIG.siteUrl}/topics/${topic.slug}`;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9BK0WHBZ1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-V9BK0WHBZ1');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic.name} | Creative Topic Hub | Photon Studio</title>
  <meta name="description" content="${topic.description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="../../assets/Logo - Favicon.png">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${topic.name} | Photon Studio">
  <meta property="og:description" content="${topic.description}">
  <meta property="og:image" content="https://photonstudio.ai/assets/Logo%20-%20Favicon.png">

  <!-- Fonts & Styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="../../css/blog.css?v=1.0.1">
</head>
<body class="blog-body">
  <header class="blog-nav">
    <div class="blog-nav__inner">
      <a href="/" class="blog-nav__brand">
        <img src="../../assets/Logo - Favicon.png" alt="Photon Studio" width="32" height="32">
        <span>PHOTON STUDIO</span>
      </a>
      <nav class="blog-nav__links">
        <a href="/" class="blog-nav__link">Home</a>
        <a href="/pricing" class="blog-nav__link">Pricing</a>
        <a href="/blog" class="blog-nav__link">Blog</a>
        <a href="https://app.photonstudio.ai" class="btn-blog-primary">Launch App</a>
      </nav>
    </div>
  </header>

  <main class="blog-hub-container">
    <nav class="blog-breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> / <a href="/blog">Blog</a> / <a href="/topics">Topics</a> / <span>${topic.name}</span>
    </nav>

    <div class="blog-hub-hero">
      <div class="badge">TOPICAL CLUSTER</div>
      <h1>${topic.name}</h1>
      <p>${topic.description}</p>
    </div>

    <div class="blog-articles-grid">
      ${articles.map(a => `
        <article class="blog-card">
          <a href="/blog/${a.slug}" class="blog-card__image-link">
            <img src="${a.featuredImage?.url || a.heroImage?.url || 'https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg'}" alt="${a.title}" loading="lazy" width="400" height="225">
          </a>
          <div class="blog-card__body">
            <h2 class="blog-card__title">
              <a href="/blog/${a.slug}">${a.title}</a>
            </h2>
            <p class="blog-card__excerpt">${a.metaDescription}</p>
            <div class="blog-card__footer">
              <a href="/blog/${a.slug}" class="read-more">Read Guide <span class="material-icons" style="font-size:16px;">arrow_forward</span></a>
            </div>
          </div>
        </article>
      `).join('\n')}
    </div>
  </main>

  <footer class="blog-footer">
    <div class="blog-footer__inner">
      <div class="blog-footer__brand">
        <p class="tagline">THE ULTIMATE AI-POWERED CAMERA CONTROL FOR FILMMAKERS & CREATORS</p>
        <p class="copy">&copy; ${new Date().getFullYear()} Apastron Labs Pvt Ltd. All rights reserved.</p>
      </div>
      <div class="blog-footer__links">
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/blog">Blog</a>
        <a href="/authors">Authors</a>
        <a href="/topics">Topics</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
    }
    /**
     * Compile Blog Hub page (/blog/index.html)
     */
    compileBlogHub(articles, topics) {
        const canonical = `${config_1.CONFIG.siteUrl}/blog`;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9BK0WHBZ1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-V9BK0WHBZ1');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog & Creative AI Insights | Photon Studio</title>
  <meta name="description" content="Expert insights, workflows, and tutorials for AI cinema, video generation, and visual storytelling powered by Photon Studio.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="../assets/Logo - Favicon.png">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="Blog & Creative AI Insights | Photon Studio">
  <meta property="og:description" content="Expert insights, workflows, and tutorials for AI cinema, video generation, and visual storytelling.">
  <meta property="og:image" content="https://photonstudio.ai/assets/Logo%20-%20Favicon.png">

  <!-- Fonts & Stylesheet -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="../css/blog.css?v=1.0.1">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://photonstudio.ai/#website",
        "url": "https://photonstudio.ai/",
        "name": "Photon Studio"
      },
      {
        "@type": "Blog",
        "@id": "https://photonstudio.ai/blog/#blog",
        "url": "https://photonstudio.ai/blog/",
        "name": "Photon Studio Blog & Creative AI Insights",
        "description": "Expert insights, tutorials, and workflows for AI cinema, generative video, and visual storytelling.",
        "publisher": {
          "@type": "Organization",
          "name": "Apastron Labs Pvt Ltd",
          "url": "https://photonstudio.ai"
        }
      }
    ]
  }
  </script>
</head>
<body class="blog-body">
  <header class="blog-nav">
    <div class="blog-nav__inner">
      <a href="/" class="blog-nav__brand">
        <img src="../assets/Logo - Favicon.png" alt="Photon Studio" width="32" height="32">
        <span>PHOTON STUDIO</span>
      </a>
      <nav class="blog-nav__links">
        <a href="/" class="blog-nav__link">Home</a>
        <a href="/imageGenerator" class="blog-nav__link">Image Gen</a>
        <a href="/videoGenerator" class="blog-nav__link">Video Gen</a>
        <a href="/pricing" class="blog-nav__link">Pricing</a>
        <a href="/blog" class="blog-nav__link active">Blog</a>
        <a href="https://app.photonstudio.ai" class="btn-blog-primary">Launch App</a>
      </nav>
    </div>
  </header>

  <main class="blog-hub-container">
    <div class="blog-hub-hero">
      <div class="badge">PHOTON STUDIO DISPATCHES</div>
      <h1>Creative AI Insights & Filmmaking Workflows</h1>
      <p>Original breakdowns, technical tutorials, and prompt frameworks for AI video artists, studios, and filmmakers.</p>
    </div>

    <!-- Topics Nav -->
    <div class="blog-topics-filter">
      <a href="/blog" class="topic-chip active">All Articles</a>
      ${topics.map(t => `<a href="/topics/${t.slug}" class="topic-chip">${t.name}</a>`).join('\n')}
    </div>

    <!-- Articles Grid -->
    <div class="blog-articles-grid">
      ${articles.map(a => `
        <article class="blog-card">
          <a href="/blog/${a.slug}" class="blog-card__image-link">
            <img src="${a.featuredImage?.url || a.heroImage?.url || 'https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg'}" alt="${a.title}" loading="lazy" width="400" height="225">
          </a>
          <div class="blog-card__body">
            <div class="blog-card__meta">
              <span>${a.primaryKeyword || 'Creative AI'}</span>
              <span>•</span>
              <span>${a.readingTimeMinutes || 5} min read</span>
            </div>
            <h2 class="blog-card__title">
              <a href="/blog/${a.slug}">${a.title}</a>
            </h2>
            <p class="blog-card__excerpt">${a.metaDescription}</p>
            <div class="blog-card__footer">
              <a href="/blog/${a.slug}" class="read-more">Read Guide <span class="material-icons" style="font-size:16px;">arrow_forward</span></a>
            </div>
          </div>
        </article>
      `).join('\n')}
    </div>
  </main>

  <footer class="blog-footer">
    <div class="blog-footer__inner">
      <div class="blog-footer__brand">
        <p class="tagline">THE ULTIMATE AI-POWERED CAMERA CONTROL FOR FILMMAKERS & CREATORS</p>
        <p class="copy">&copy; ${new Date().getFullYear()} Apastron Labs Pvt Ltd. All rights reserved.</p>
      </div>
      <div class="blog-footer__links">
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/blog">Blog</a>
        <a href="/authors">Authors</a>
        <a href="/topics">Topics</a>
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms-conditions">Terms & Conditions</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
    }
}
exports.HtmlCompilerService = HtmlCompilerService;
//# sourceMappingURL=compiler.js.map