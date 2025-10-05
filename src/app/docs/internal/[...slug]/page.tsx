import { notFound, redirect } from 'next/navigation';
import { authenticateUser } from '@/lib/auth-utils';
import { DocsLoader } from '@/lib/docs/loader';
import { DocsLayout } from '@/components/docs/DocsLayout';

interface PageProps {
  params: {
    slug: string[];
  };
  searchParams: {
    audience?: string;
    category?: string;
    search?: string;
  };
}

export default async function InternalDocPage({ params, searchParams }: PageProps) {
  // Authenticate user
  const auth = await authenticateUser();
  
  if ('error' in auth) {
    redirect('/login?redirect=/docs/internal');
  }

  const slug = params.slug.join('/');
  
  try {
    const doc = await DocsLoader.getDocBySlug(slug, 'internal');
    
    if (!doc) {
      notFound();
    }

    return (
      <DocsLayout
        doc={doc}
        visibility="internal"
        initialAudience={searchParams.audience as any}
        initialCategory={searchParams.category as any}
        initialSearch={searchParams.search}
      />
    );
  } catch (error) {
    console.error('Error loading internal doc:', error);
    notFound();
  }
}

export async function generateStaticParams() {
  try {
    const index = await DocsLoader.getIndex();
    const internalDocs = index.nodes.filter(doc => doc.visibility === 'internal');
    
    return internalDocs.map(doc => ({
      slug: doc.slug.split('/')
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  
  try {
    const doc = await DocsLoader.getDocBySlug(slug, 'internal');
    
    if (!doc) {
      return {
        title: 'Internal Documentation Not Found',
        description: 'The requested internal documentation page could not be found.'
      };
    }

    return {
      title: `${doc.title} - Kanvaro Internal Documentation`,
      description: doc.summary,
      openGraph: {
        title: doc.title,
        description: doc.summary,
        type: 'article',
        publishedTime: doc.updated,
      },
    };
  } catch (error) {
    return {
      title: 'Internal Documentation Error',
      description: 'An error occurred while loading the internal documentation.'
    };
  }
}
