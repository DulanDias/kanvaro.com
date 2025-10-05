import Link from 'next/link';
import { DocsLoader } from '@/lib/docs/loader';
import { DocsLayout } from '@/components/docs/DocsLayout';
import { Category, Audience } from '@/lib/docs/types';

interface PageProps {
  searchParams: {
    audience?: string;
    category?: string;
    search?: string;
  };
}

const categoryLabels: Record<Category, string> = {
  concepts: 'Concepts',
  'how-to': 'How-to Guides',
  tutorial: 'Tutorials',
  reference: 'Reference',
  operations: 'Operations',
  'self-hosting': 'Self-hosting'
};

const audienceLabels: Record<Audience, string> = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  team_member: 'Team Member',
  client: 'Client',
  viewer: 'Viewer',
  self_host_admin: 'Self-host Admin'
};

export default async function PublicDocsIndex({ searchParams }: PageProps) {
  const { audience, category, search } = searchParams;
  
  const docs = await DocsLoader.getDocsByFilter({
    visibility: 'public',
    audience: audience as Audience,
    category: category as Category,
    search
  });

  const categories = await DocsLoader.getCategories('public');
  const audiences = await DocsLoader.getAudiences('public');

  return (
    <DocsLayout
      visibility="public"
      initialAudience={audience as Audience}
      initialCategory={category as Category}
      initialSearch={search}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Kanvaro Documentation
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Comprehensive guides and reference materials for using Kanvaro project management platform.
          </p>
          
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{docs.length}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{Object.keys(categories).length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(audiences).length}</div>
              <div className="text-sm text-gray-600">Audiences</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        {Object.entries(categories).map(([categoryKey, categoryDocs]) => {
          if (categoryDocs.length === 0) return null;

          return (
            <div key={categoryKey} className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {categoryLabels[categoryKey as Category]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryDocs.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/docs/public/${doc.slug}`}
                    className="block bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {doc.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {doc.audiences.slice(0, 2).map(audience => (
                          <span
                            key={audience}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {audienceLabels[audience]}
                          </span>
                        ))}
                        {doc.audiences.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{doc.audiences.length - 2} more
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.updated).toISOString().split('T')[0]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* No results */}
        {docs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documentation found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query to find what you're looking for.
            </p>
            <Link
              href="/docs/public"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View All Documentation
            </Link>
          </div>
        )}

        {/* Getting Started */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600 mb-6">
            New to Kanvaro? Start with these essential guides to get up and running quickly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/docs/public/getting-started/setup-wizard"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Setup Wizard</h3>
                <p className="text-sm text-gray-600">Initial system configuration</p>
              </div>
            </Link>
            
            <Link
              href="/docs/public/getting-started/first-project"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Your First Project</h3>
                <p className="text-sm text-gray-600">Create and manage projects</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}

export const metadata = {
  title: 'Documentation - Kanvaro',
  description: 'Comprehensive guides and reference materials for using Kanvaro project management platform.',
  openGraph: {
    title: 'Kanvaro Documentation',
    description: 'Comprehensive guides and reference materials for using Kanvaro project management platform.',
    type: 'website',
  },
};