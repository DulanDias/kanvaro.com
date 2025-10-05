import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DocNode, DocFrontmatter, DocsIndex, SearchIndexItem, DocHeading, Audience, Category, Visibility } from './types';

const DOCS_PATH = path.join(process.cwd(), 'docs');
const CACHE_KEY = 'docs-index-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// In-memory cache
let cache: { index: DocsIndex; timestamp: number } | null = null;

export class DocsLoader {
  private static validateFrontmatter(data: any): DocFrontmatter {
    const required = ['slug', 'title', 'summary', 'visibility', 'audiences', 'category', 'order', 'updated'];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required frontmatter field: ${field}`);
      }
    }

    // Validate audiences
    const validAudiences: Audience[] = ['admin', 'project_manager', 'team_member', 'client', 'viewer', 'self_host_admin'];
    if (!Array.isArray(data.audiences) || !data.audiences.every((a: string) => validAudiences.includes(a as Audience))) {
      throw new Error('Invalid audiences in frontmatter');
    }

    // Validate category
    const validCategories: Category[] = ['concepts', 'how-to', 'tutorial', 'reference', 'operations', 'self-hosting'];
    if (!validCategories.includes(data.category)) {
      throw new Error('Invalid category in frontmatter');
    }

    // Validate visibility
    if (!['public', 'internal'].includes(data.visibility)) {
      throw new Error('Invalid visibility in frontmatter');
    }

    return data as DocFrontmatter;
  }

  private static extractHeadings(content: string): DocHeading[] {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: DocHeading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      headings.push({ level, text, id });
    }

    return headings;
  }

  private static async readDocFile(filePath: string): Promise<DocNode | null> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      const frontmatter = this.validateFrontmatter(data);
      const headings = this.extractHeadings(content);
      
      return {
        ...frontmatter,
        content,
        headings,
        path: filePath
      };
    } catch (error) {
      console.warn(`Failed to load doc file ${filePath}:`, error);
      return null;
    }
  }

  private static async loadAllDocs(): Promise<DocNode[]> {
    const docs: DocNode[] = [];
    
    if (!fs.existsSync(DOCS_PATH)) {
      console.warn(`Docs directory not found: ${DOCS_PATH}`);
      return docs;
    }

    const files = fs.readdirSync(DOCS_PATH, { recursive: true });
    const mdFiles = files.filter(file => 
      typeof file === 'string' && file.endsWith('.md')
    );

    for (const file of mdFiles) {
      const filePath = path.join(DOCS_PATH, file as string);
      const doc = await this.readDocFile(filePath);
      if (doc) {
        docs.push(doc);
      }
    }

    return docs.sort((a, b) => a.order - b.order);
  }

  private static buildIndex(docs: DocNode[]): DocsIndex {
    const categories: Record<Category, DocNode[]> = {
      concepts: [],
      'how-to': [],
      tutorial: [],
      reference: [],
      operations: [],
      'self-hosting': []
    };

    const bySlug: Record<string, DocNode> = {};
    const byAudience: Record<Audience, DocNode[]> = {
      admin: [],
      project_manager: [],
      team_member: [],
      client: [],
      viewer: [],
      self_host_admin: []
    };

    const searchIndex: SearchIndexItem[] = [];

    for (const doc of docs) {
      // Group by category
      categories[doc.category].push(doc);
      
      // Index by slug
      bySlug[doc.slug] = doc;
      
      // Index by audience
      for (const audience of doc.audiences) {
        byAudience[audience].push(doc);
      }
      
      // Build search index
      searchIndex.push({
        slug: doc.slug,
        title: doc.title,
        summary: doc.summary,
        headings: doc.headings.map(h => h.text),
        content: doc.content
      });
    }

    return {
      nodes: docs,
      categories,
      bySlug,
      byAudience,
      searchIndex
    };
  }

  public static async getIndex(forceRefresh = false): Promise<DocsIndex> {
    // Check cache first
    if (!forceRefresh && cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return cache.index;
    }

    // Load docs
    const docs = await this.loadAllDocs();
    const index = this.buildIndex(docs);
    
    // Update cache
    cache = { index, timestamp: Date.now() };
    
    return index;
  }

  public static async getDocBySlug(slug: string, visibility?: Visibility): Promise<DocNode | null> {
    const index = await this.getIndex();
    const doc = index.bySlug[slug];
    
    if (!doc) {
      return null;
    }

    if (visibility && doc.visibility !== visibility) {
      return null;
    }

    return doc;
  }

  public static async getDocsByFilter(filter: {
    audience?: Audience;
    category?: Category;
    visibility?: Visibility;
    search?: string;
  }): Promise<DocNode[]> {
    const index = await this.getIndex();
    let docs = index.nodes;

    // Filter by visibility
    if (filter.visibility) {
      docs = docs.filter(doc => doc.visibility === filter.visibility);
    }

    // Filter by audience
    if (filter.audience) {
      docs = docs.filter(doc => doc.audiences.includes(filter.audience!));
    }

    // Filter by category
    if (filter.category) {
      docs = docs.filter(doc => doc.category === filter.category);
    }

    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      docs = docs.filter(doc => {
        const searchableText = [
          doc.title,
          doc.summary,
          ...doc.headings.map(h => h.text),
          doc.content
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
      });
    }

    return docs;
  }

  public static async searchDocs(query: string, visibility?: Visibility): Promise<DocNode[]> {
    const index = await this.getIndex();
    const searchTerm = query.toLowerCase();
    
    let docs = index.nodes;
    
    if (visibility) {
      docs = docs.filter(doc => doc.visibility === visibility);
    }

    return docs.filter(doc => {
      const searchableText = [
        doc.title,
        doc.summary,
        ...doc.headings.map(h => h.text),
        doc.content
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  }

  public static async getCategories(visibility?: Visibility): Promise<Record<Category, DocNode[]>> {
    const index = await this.getIndex();
    
    if (!visibility) {
      return index.categories;
    }

    const filteredCategories: Record<Category, DocNode[]> = {
      concepts: [],
      'how-to': [],
      tutorial: [],
      reference: [],
      operations: [],
      'self-hosting': []
    };

    for (const [category, docs] of Object.entries(index.categories)) {
      filteredCategories[category as Category] = docs.filter(doc => doc.visibility === visibility);
    }

    return filteredCategories;
  }

  public static async getAudiences(visibility?: Visibility): Promise<Record<Audience, DocNode[]>> {
    const index = await this.getIndex();
    
    if (!visibility) {
      return index.byAudience;
    }

    const filteredAudiences: Record<Audience, DocNode[]> = {
      admin: [],
      project_manager: [],
      team_member: [],
      client: [],
      viewer: [],
      self_host_admin: []
    };

    for (const [audience, docs] of Object.entries(index.byAudience)) {
      filteredAudiences[audience as Audience] = docs.filter(doc => doc.visibility === visibility);
    }

    return filteredAudiences;
  }

  public static clearCache(): void {
    cache = null;
  }
}
