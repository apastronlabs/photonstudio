export type SearchIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';

export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived';

export interface SeoKeyword {
  id: string;
  keyword: string;
  searchIntent: SearchIntent;
  monthlyVolume?: number;
  difficulty?: number;
  topicId?: string;
  clusterName?: string;
  status: 'discovered' | 'briefed' | 'drafted' | 'published';
  targetAudience?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeoTopic {
  id: string;
  slug: string;
  name: string;
  description: string;
  pillarArticleId?: string;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeoBrief {
  id: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntent;
  workingTitle: string;
  targetWordCount: number;
  competitorOutlines?: string[];
  contentGaps?: string[];
  outline: {
    heading: string;
    level: 2 | 3;
    keyPoints: string[];
    suggestedInternalLinks?: string[];
    visualPromptIdea?: string;
  }[];
  productFeaturesToHighlight: string[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface SeoAuthor {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  credentials?: string[];
}

export type ContentBlock =
  | { type: 'heading'; level: 2 | 3 | 4; text: string; id?: string }
  | { type: 'paragraph'; text: string }
  | { type: 'markdown'; markdown: string }
  | { type: 'image'; url: string; alt: string; caption?: string; width?: number; height?: number }
  | { type: 'video'; url: string; poster?: string; caption?: string; autoplay?: boolean; loop?: boolean; muted?: boolean }
  | { type: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { type: 'blockquote'; quote: string; cite?: string; author?: string }
  | { type: 'citations'; items: { text: string; url: string }[] }
  | { type: 'callout'; variant?: 'note' | 'tip' | 'warning' | 'pro'; title?: string; content: string }
  | { type: 'code'; language?: string; code: string; caption?: string };

export interface RelatedArticleRef {
  title: string;
  slug: string;
  description?: string;
  heroImage?: string;
  readingTimeMinutes?: number;
}

export interface StructuredArticleInput {
  title: string;
  subtitle?: string; // dek
  slug: string;
  description: string; // meta description
  author: string | SeoAuthor;
  publishedAt?: string;
  updatedAt?: string;
  heroImage?: string | {
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
  topic?: string | SeoTopic;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  content: string | ContentBlock[];
  relatedArticles?: RelatedArticleRef[];
  citations?: { text: string; url: string }[];
  canonicalUrl?: string;
  schema?: object; // optional custom JSON-LD override
}

export interface SeoArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  metaDescription: string;
  canonicalUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent?: SearchIntent;
  topicId: string;
  topicName?: string;
  authorId: string;
  author?: SeoAuthor;
  contentMarkdown?: string;
  contentBlocks?: ContentBlock[];
  contentHtml?: string;
  heroImage?: {
    url: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
  };
  featuredImage?: {
    url: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
  };
  tableOfContents?: {
    id: string;
    text: string;
    level: number;
  }[];
  relatedArticles?: RelatedArticleRef[];
  citations?: { text: string; url: string }[];
  readingTimeMinutes: number;
  factCheckScore?: number;
  factCheckNotes?: string;
  status: ArticleStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeoSettings {
  autopilotEnabled: boolean;
  publishingFrequency: 'daily' | 'weekly' | 'manual';
  maxArticlesPerRun: number;
  autoPublishWithoutReview: boolean;
  defaultAuthorId: string;
  targetLanguage: string;
  updatedAt: string;
}

export interface SeoLog {
  id: string;
  event: string;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: string;
}
