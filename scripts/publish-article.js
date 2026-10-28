const path = require('path');
const fs = require('fs');

// Import compiled services from functions/lib
const { HtmlCompilerService } = require('../functions/lib/services/compiler');
const { PublisherService } = require('../functions/lib/services/publisher');

async function publishFromStructuredData(articleData, options = {}) {
  const compiler = new HtmlCompilerService();
  const publicDir = options.publicDir || path.resolve(__dirname, '../public');
  const publisher = new PublisherService(publicDir);

  console.log(`[Publishing] Processing article: "${articleData.title}" (${articleData.slug})...`);

  // 1. Compile Article HTML
  const compiled = await compiler.compileArticle(articleData);

  // 2. Write Article static HTML
  const articleFile = await publisher.publishArticleHtml(compiled.slug, compiled.html);
  console.log(`[Publishing] Wrote article HTML: ${articleFile}`);

  // 3. Compile & Write Authors
  const authorObj = compiler.normalizeAuthor(articleData.author);
  const authors = [authorObj];
  const articlesList = [{
    id: compiled.slug,
    slug: compiled.slug,
    title: articleData.title,
    metaDescription: articleData.description,
    canonicalUrl: compiled.canonicalUrl,
    primaryKeyword: articleData.primaryKeyword || 'AI Video',
    secondaryKeywords: [],
    authorId: authorObj.slug,
    topicId: 'ai-filmmaking',
    readingTimeMinutes: compiled.readingTimeMinutes,
    status: 'published',
    heroImage: compiler.normalizeHeroImage(articleData.heroImage),
    publishedAt: articleData.publishedAt || new Date().toISOString(),
    updatedAt: articleData.updatedAt || new Date().toISOString()
  }];

  const authorProfileHtml = compiler.compileAuthorProfile(authorObj, articlesList);
  await publisher.publishAuthorHtml(authorObj.slug, authorProfileHtml);
  const authorsIndexHtml = compiler.compileAuthorsIndex(authors);
  await publisher.publishAuthorsIndexHtml(authorsIndexHtml);
  console.log(`[Publishing] Wrote /authors/ and /authors/${authorObj.slug}/`);

  // 4. Compile & Write Topics
  const topicObj = compiler.normalizeTopic(articleData.topic) || {
    id: 'ai-filmmaking',
    slug: 'ai-filmmaking',
    name: 'AI Filmmaking',
    description: 'Cinematography, prompt choreography, and visual camera direction with next-generation AI models.'
  };
  const topics = [topicObj];

  const topicClusterHtml = compiler.compileTopicCluster(topicObj, articlesList);
  await publisher.publishTopicHtml(topicObj.slug, topicClusterHtml);
  const topicsIndexHtml = compiler.compileTopicsIndex(topics);
  await publisher.publishTopicsIndexHtml(topicsIndexHtml);
  console.log(`[Publishing] Wrote /topics/ and /topics/${topicObj.slug}/`);

  // 5. Compile & Write Blog Hub (/blog/index.html)
  const hubHtml = compiler.compileBlogHub(articlesList, topics);
  await publisher.publishBlogHubHtml(hubHtml);
  console.log(`[Publishing] Wrote /blog/index.html`);

  // 6. Regenerate Sitemap and Robots
  await publisher.regenerateSitemap(articlesList, authors, topics);
  await publisher.regenerateRobotsTxt();
  await publisher.updateLlmsTxt(articlesList);
  console.log(`[Publishing] Dynamically updated sitemap.xml, robots.txt, and llms.txt!`);

  return {
    success: true,
    slug: compiled.slug,
    canonicalUrl: compiled.canonicalUrl,
    articlePath: articleFile
  };
}

module.exports = { publishFromStructuredData };

// If run directly from CLI
if (require.main === module) {
  const sampleArticle = {
    title: "Mastering AI Cinematography: Camera Control, Lighting, and Prompts",
    subtitle: "A comprehensive director's guide to achieving cinematic camera motion, coherent lighting schemes, and photorealistic fidelity with Nano Banana Pro and Seedance 2.0.",
    slug: "ai-cinematography-guide",
    description: "Learn how to direct cinematic camera movement, depth of field, and studio lighting setups using Nano Banana Pro and Seedance 2.0 in Photon Studio.",
    author: {
      name: "Varun Kuntoor",
      slug: "varun-kuntoor",
      role: "Founder & CEO, Photon Studio",
      bio: "Filmmaker, technologist, and founder of Photon Studio (Apastron Labs). Specializing in AI-assisted cinematography, multi-model workflows, and the future of visual media.",
      credentials: ["Founder of Apastron Labs", "AI Cinematography Pioneer"]
    },
    publishedAt: "2026-10-02T12:00:00Z",
    updatedAt: "2026-10-02T12:00:00Z",
    heroImage: {
      url: "https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg",
      alt: "Cinematic portrait with golden hour rim lighting",
      caption: "Achieving photorealistic cinematic lighting in Photon Studio using Nano Banana Pro with 85mm f/1.4 lens emulation.",
      width: 1200,
      height: 675
    },
    topic: {
      name: "AI Filmmaking",
      slug: "ai-filmmaking",
      description: "Directing cinematic cameras, lighting choreography, and temporal consistency with advanced AI video foundation models."
    },
    primaryKeyword: "AI Cinematography",
    secondaryKeywords: ["Nano Banana Pro", "Seedance 2.0", "AI camera control", "cinematic lighting prompts"],
    content: [
      {
        type: "paragraph",
        text: "Directing AI video is no longer about rolling the dice on stochastic random generations. Modern generative cinematography demands precision camera control, reproducible focal lengths, and intentional lighting hierarchies. Inside Photon Studio, creators combine cutting-edge foundation models with structured multi-model pipelines to achieve Hollywood-grade visuals."
      },
      {
        type: "heading",
        level: 2,
        text: "The Three Pillars of AI Cinematography"
      },
      {
        type: "paragraph",
        text: "Achieving true cinematic quality requires treating the AI prompt not as a caption, but as a call-sheet for a virtual camera crew. The three primary variables every filmmaker must control are:"
      },
      {
        type: "table",
        caption: "Core Cinematography Parameters in Photon Studio",
        headers: ["Parameter", "Traditional Filmmaking Analogy", "Photon Studio Workflow"],
        rows: [
          ["Camera Motion", "Dolly, Crane, Steadicam, Orbit", "Camera Angles Selector & Seedance 2.0 Motion Tokens"],
          ["Lens Emulation", "Anamorphic, 35mm, 50mm, 85mm prime", "Focal Length prompts & InPaint Depth Mapping"],
          ["Lighting Architecture", "Key, Fill, Rim, Volumetric haze", "Relighting Tool & Ambient Color Gradients"]
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Video Demonstration: Dynamic Camera Movement"
      },
      {
        type: "video",
        url: "https://media.photonstudio.ai/videos/photonstudio%20-%20surfing.mp4",
        caption: "Continuous tracking shot rendered in 4K using Seedance 2.0 inside Photon Studio's Canvas.",
        autoplay: true,
        loop: true,
        muted: true
      },
      {
        type: "heading",
        level: 2,
        text: "Lighting Setup and Prompt Hierarchy"
      },
      {
        type: "paragraph",
        text: "Lighting establishes mood, genre, and emotional weight. Rather than relying on generic adjectives like 'hyperrealistic' or 'photorealistic', describe the exact physical lighting instruments and their color temperatures:"
      },
      {
        type: "code",
        language: "plaintext",
        caption: "Recommended prompt structure for cinematic lighting",
        code: "Cinematic medium close-up, anamorphic 2.39:1 aspect ratio, 35mm Arri Alexa 65 sensor. Golden hour low-angle sunlight hitting camera-left as a warm 3200K rim light, cool 5600K ambient shadow fill, subtle volumetric atmospheric dust haze, shallow depth of field, natural skin texture."
      },
      {
        type: "blockquote",
        quote: "The breakthrough in generative cinema isn't higher pixel counts; it's temporal coherence and director intent across every cut.",
        author: "Varun Kuntoor",
        cite: "Photon Studio Keynote"
      },
      {
        type: "heading",
        level: 2,
        text: "Using One Canvas for Character Continuity"
      },
      {
        type: "paragraph",
        text: "One of the greatest challenges in AI video is keeping character faces and costumes consistent from shot to shot. In Photon Studio, you can construct a Character Consistency Sheet on the Canvas, run Relighting, and pass that node directly into Seedance 2.0 to preserve facial morphology across dynamic camera turns."
      },
      {
        type: "image",
        url: "https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg",
        alt: "Character Consistency Sheet",
        caption: "Multi-angle consistency board constructed on Photon Studio Canvas."
      }
    ],
    citations: [
      { text: "American Society of Cinematographers (ASC) — Lighting Principles", url: "https://theasc.com" },
      { text: "Photon Studio AI Video Generation Specifications", url: "https://photonstudio.ai/videoGenerator" },
      { text: "Seedance 2.0 Model Capabilities Documentation", url: "https://photonstudio.ai/pricing" }
    ],
    relatedArticles: [
      {
        title: "One Canvas: Building Multi-Model Moodboards",
        slug: "one-canvas-workflow",
        heroImage: "https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg",
        readingTimeMinutes: 5
      },
      {
        title: "Higgsfield AI vs. Seedance 2.0 vs. Veo 3.1: Benchmark",
        slug: "higgsfield-seedance-veo-comparison",
        heroImage: "https://media.photonstudio.ai/images/character-sheet/Beautiful%20Surfer.jpg",
        readingTimeMinutes: 8
      }
    ]
  };

  publishFromStructuredData(sampleArticle)
    .then(res => console.log('Successfully published article:', res))
    .catch(err => {
      console.error('Publishing failed:', err);
      process.exit(1);
    });
}
