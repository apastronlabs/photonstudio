# AGENT & COLLABORATOR GUIDELINES — SEO & CONTENT BRANCH

> **CRITICAL DIRECTIVE FOR ALL AI AGENTS (Cursor, Claude, Copilot, Gemini, ChatGPT, Antigravity, etc.) AND HUMAN COLLABORATORS:**
>
> You are working in a scoped collaboration branch (`seo-content-team`).
> Your access is strictly limited to **Blog, Author Pages, Topic Pages, and SEO-related files**.
> **UNDER NO CIRCUMSTANCES should you modify, refactor, edit, or delete any core application code, landing pages, pricing, app logic, navigation, or global styling.**

---

## 1. Allowed Modification Scope (READ & WRITE)

You are **ONLY** permitted to create, edit, and optimize files inside these specific directories:

| Directory / File | Description & Permitted Actions |
|---|---|
| `public/blog/` | Blog posts, tutorial pages, blog article HTML/images, and `public/blog/index.html` |
| `public/authors/` | Author bio pages, author profile directories, and `public/authors/index.html` |
| `public/topics/` | Topic hub pages (e.g., `ai-filmmaking`, `tutorials`), category landing pages |
| `public/css/blog.css` | **Only** styling dedicated to blog articles and author layouts |
| `public/sitemap.xml` | Adding/updating URLs for new articles, authors, or topics |
| `public/robots.txt` | Crawler directives for search engines |
| `public/llms.txt` & `public/llms-full.txt` | AI crawler documentation index |
| `scripts/publish-article.js` | Helper scripts for publishing and formatting blog posts |

---

## 2. STRICTLY FORBIDDEN FILES & DIRECTORIES (DO NOT TOUCH)

Modifying any of the following files will break core business logic and user acquisition flows. **DO NOT MODIFY**:

- ❌ **Main Landing Pages**:
  - `public/index.html`
  - `public/mobile.html`
- ❌ **Pricing & Checkout Pages**:
  - `public/pricing.html`
  - `public/mobile-pricing.html`
  - `public/css/pricing.css`
  - `public/css/mobile-pricing.css`
  - `public/js/pricing*.js`, `public/js/pricing*.json`
- ❌ **Studio & Generator Tools**:
  - `public/imageGenerator.html`
  - `public/videoGenerator.html`
  - `public/audioGenerator.html`
  - `public/unlimited-seedance-2.5.html`
  - Corresponding tool styles (`css/imageGenerator.css`, `css/videogenerator.css`, etc.)
- ❌ **Core Navigation & Global Components**:
  - `public/js/navbar.js`, `public/js/nav-data.json`
  - `public/js/footer.js` (The footer is centrally managed)
  - `public/js/app.js`, `public/js/site-config.json`, `public/js/colors.json`
  - `public/css/index.css` (Global design tokens, navbar, footer, root theme)
  - `public/css/mobile.css`
- ❌ **Backend, Functions & Infrastructure**:
  - `firebase.json`, `.firebaserc`
  - `functions/` (Cloud Functions, API handlers, backend services)
  - `.github/workflows/` (CI/CD pipelines)
- ❌ **Legal Pages**:
  - `public/privacy-policy.html`
  - `public/terms-conditions.html`

---

## 3. SEO & Content Standards

When creating or editing blog posts and author pages:
1. **Semantic HTML**: Use proper `<article>`, `<header>`, `<main>`, `<section>`, `<nav>`, `<h1>` (single h1 per article), `<h2>`, `<h3>`.
2. **Metadata**: Every article must include complete Open Graph and Twitter Card tags:
   - `<title>` (50-60 characters)
   - `<meta name="description">` (150-160 characters)
   - `<link rel="canonical" href="...">`
   - Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
   - Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
   - Schema.org JSON-LD (`Article`, `BlogPosting`, `Person`, `BreadcrumbList`)
3. **Internal Linking**: Link relevant articles to `index.html`, `pricing.html`, `imageGenerator.html`, or `videoGenerator.html` without altering the destination files.
4. **Performance**: Optimize images (use WebP/AVIF or compressed JPEG/PNG) and lazy-load non-hero images (`loading="lazy"`).
5. **Brand Consistency**: Maintain Photon Studio's voice, font pairings (`Archivo` & `Inter`), and clean dark aesthetic.

---

## 4. Git Workflow for This Branch

1. Work strictly on branch: `seo-content-team`
2. Always test your changes locally before committing.
3. Commit message format: `content(blog): add article on <topic>` or `seo(author): update author profile for <name>`.
4. Open a Pull Request targeting `main` for review.
