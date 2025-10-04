import { useState, useCallback } from 'react'

interface CompletionStatus {
  stories: { [key: string]: { completed: number; total: number } }
  sprints: { [key: string]: { completed: number; total: number } }
  epics: { [key: string]: { completed: number; total: number } }
}

export function useCompletion() {
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    stories: {},
    sprints: {},
    epics: {}
  })

  const checkProjectCompletion = useCallback(async (projectId: string) => {
    try {
      const response = await fetch('/api/completion/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId })
      })

      if (response.ok) {
        // Optionally refresh data or show notification
        console.log('Completion check completed')
      }
    } catch (error) {
      console.error('Error checking completion:', error)
    }
  }, [])

  const updateCompletionStatus = useCallback((type: 'stories' | 'sprints' | 'epics', id: string, completed: number, total: number) => {
    setCompletionStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: { completed, total }
      }
    }))
  }, [])

  const getCompletionPercentage = useCallback((type: 'stories' | 'sprints' | 'epics', id: string): number => {
    const status = completionStatus[type][id]
    if (!status || status.total === 0) return 0
    return Math.round((status.completed / status.total) * 100)
  }, [completionStatus])

  const isCompleted = useCallback((type: 'stories' | 'sprints' | 'epics', id: string): boolean => {
    const status = completionStatus[type][id]
    return status ? status.completed === status.total && status.total > 0 : false
  }, [completionStatus])

  return {
    completionStatus,
    checkProjectCompletion,
    updateCompletionStatus,
    getCompletionPercentage,
    isCompleted
  }
}
