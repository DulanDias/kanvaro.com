export type Audience = 
  | 'admin' 
  | 'project_manager' 
  | 'team_member' 
  | 'client' 
  | 'viewer' 
  | 'self_host_admin';

export type Category = 
  | 'concepts' 
  | 'how-to' 
  | 'tutorial' 
  | 'reference' 
  | 'operations' 
  | 'self-hosting';

export type Visibility = 'public' | 'internal';

export interface DocFrontmatter {
  slug: string;
  title: string;
  summary: string;
  visibility: Visibility;
  audiences: Audience[];
  category: Category;
  order: number;
  updated: string;
}

export interface DocNode {
  slug: string;
  title: string;
  summary: string;
  visibility: Visibility;
  audiences: Audience[];
  category: Category;
  order: number;
  updated: string;
  content: string;
  headings: DocHeading[];
  path: string;
}

export interface DocHeading {
  level: number;
  text: string;
  id: string;
}

export interface DocsIndex {
  nodes: DocNode[];
  categories: Record<Category, DocNode[]>;
  bySlug: Record<string, DocNode>;
  byAudience: Record<Audience, DocNode[]>;
  searchIndex: SearchIndexItem[];
}

export interface SearchIndexItem {
  slug: string;
  title: string;
  summary: string;
  headings: string[];
  content: string;
}

export interface DocsFilter {
  audience?: Audience;
  category?: Category;
  visibility?: Visibility;
  search?: string;
}

export interface DocsConfig {
  docsPath: string;
  cacheEnabled: boolean;
  watchMode: boolean;
}
