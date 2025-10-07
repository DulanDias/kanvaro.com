import { notFound } from 'next/navigation';
import { DocsLoader } from '@/lib/docs/loader';
import { DocsLayout } from '@/components/docs/DocsLayout';

interface PageProps {
  params: {
    slug: string[];
  };
}

export default async function PublicDocPage({ params }: PageProps) {
  const slug = params.slug.join('/');
  
  try {
    const doc = await DocsLoader.getDocBySlug(slug, 'public');
    
    if (!doc) {
      notFound();
    }

    return (
      <DocsLayout
        doc={doc}
        visibility="public"
      />
    );
  } catch (error) {
    console.error('Error loading public doc:', error);
    notFound();
  }
}

export async function generateStaticParams() {
  try {
    const index = await DocsLoader.getIndex();
    const publicDocs = index.nodes.filter(doc => doc.visibility === 'public');
    
    return publicDocs.map(doc => ({
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
    const doc = await DocsLoader.getDocBySlug(slug, 'public');
    
    if (!doc) {
      return {
        title: 'Documentation Not Found',
        description: 'The requested documentation page could not be found.'
      };
    }

    return {
      title: `${doc.title} - Kanvaro Documentation`,
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
      title: 'Documentation Error',
      description: 'An error occurred while loading the documentation.'
    };
  }
}
