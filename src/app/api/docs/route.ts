import { NextRequest, NextResponse } from 'next/server';
import { DocsLoader } from '@/lib/docs/loader';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const slug = searchParams.get('slug');
    const audience = searchParams.get('audience') as any;
    const category = searchParams.get('category') as any;
    const visibility = searchParams.get('visibility') as any;
    const search = searchParams.get('search');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    switch (action) {
      case 'index':
        const index = await DocsLoader.getIndex(forceRefresh);
        return NextResponse.json(index);

      case 'doc':
        if (!slug) {
          return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }
        const doc = await DocsLoader.getDocBySlug(slug, visibility);
        return NextResponse.json(doc);

      case 'filter':
        const filteredDocs = await DocsLoader.getDocsByFilter({
          audience,
          category,
          visibility,
          search: search || undefined
        });
        return NextResponse.json(filteredDocs);

      case 'search':
        if (!search) {
          return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }
        const searchResults = await DocsLoader.searchDocs(search, visibility);
        return NextResponse.json(searchResults);

      case 'categories':
        const categories = await DocsLoader.getCategories(visibility);
        return NextResponse.json(categories);

      case 'audiences':
        const audiences = await DocsLoader.getAudiences(visibility);
        return NextResponse.json(audiences);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Docs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
