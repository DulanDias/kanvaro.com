import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Mock search results - in a real app, this would search the database
    const mockResults = [
      {
        id: '1',
        title: 'Website Redesign Project',
        description: 'Complete redesign of the company website',
        type: 'project',
        url: '/projects/1'
      },
      {
        id: '2',
        title: 'Update user interface components',
        description: 'Task in Website Redesign project',
        type: 'task',
        url: '/tasks/1'
      },
      {
        id: '3',
        title: 'John Doe',
        description: 'Team member - Project Manager',
        type: 'user',
        url: '/team/members/1'
      },
      {
        id: '4',
        title: 'Mobile App Development',
        description: 'Native mobile application project',
        type: 'project',
        url: '/projects/2'
      }
    ]

    // Filter results based on query
    const filteredResults = mockResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
    )

    return NextResponse.json(filteredResults)
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
