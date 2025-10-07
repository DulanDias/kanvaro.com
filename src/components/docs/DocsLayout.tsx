'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DocNode, Audience, Category } from '@/lib/docs/types';
import { Sidebar } from './Sidebar';
import { AudienceFilter } from './AudienceFilter';
import { DocSearch } from './DocSearch';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DocsLayoutProps {
  doc?: DocNode;
  children?: React.ReactNode;
  visibility: 'public' | 'internal';
  initialAudience?: Audience;
  initialCategory?: Category;
  initialSearch?: string;
}

function DocsLayoutContent({ 
  doc, 
  children, 
  visibility,
  initialAudience,
  initialCategory,
  initialSearch
}: DocsLayoutProps) {
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<Audience | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize state from URL params or initial props
  useEffect(() => {
    const audience = searchParams.get('audience') as Audience || initialAudience;
    const category = searchParams.get('category') as Category || initialCategory;
    const search = searchParams.get('search') || initialSearch || '';
    
    setSelectedAudience(audience);
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [searchParams, initialAudience, initialCategory, initialSearch]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          visibility={visibility}
          selectedAudience={selectedAudience}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onAudienceChange={setSelectedAudience}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-background border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-foreground">
                  {visibility === 'internal' ? 'Internal Documentation' : 'Documentation'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <AudienceFilter
                  selectedAudience={selectedAudience}
                  onAudienceChange={setSelectedAudience}
                  visibility={visibility}
                />
                <DocSearch
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  visibility={visibility}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {doc ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Doc header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{doc.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">{doc.summary}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {doc.category.replace('-', ' ')}
                  </span>
                  <span>Updated {new Date(doc.updated).toISOString().split('T')[0]}</span>
                  <div className="flex space-x-1">
                    {doc.audiences.map(audience => (
                      <span 
                        key={audience}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
                      >
                        {audience.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table of contents */}
              {doc.headings.length > 0 && (
                <div className="mb-8 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Table of Contents</h3>
                  <nav className="space-y-1">
                    {doc.headings.map((heading, index) => (
                      <a
                        key={index}
                        href={`#${heading.id}`}
                        className={`block text-sm text-muted-foreground hover:text-primary ${
                          heading.level === 1 ? 'font-medium' : 
                          heading.level === 2 ? 'ml-2' : 
                          heading.level === 3 ? 'ml-4' : 'ml-6'
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Doc content */}
              <MarkdownRenderer doc={doc} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export function DocsLayout(props: DocsLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded bg-primary/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading documentation...</p>
        </div>
      </div>
    }>
      <DocsLayoutContent {...props} />
    </Suspense>
  );
}

export default DocsLayout;
