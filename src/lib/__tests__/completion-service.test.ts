import { CompletionService } from '../completion-service'
import { Task } from '@/models/Task'
import { Story } from '@/models/Story'
import { Sprint } from '@/models/Sprint'
import { Epic } from '@/models/Epic'

// Mock the models
jest.mock('@/models/Task')
jest.mock('@/models/Story')
jest.mock('@/models/Sprint')
jest.mock('@/models/Epic')

const mockTask = Task as jest.Mocked<typeof Task>
const mockStory = Story as jest.Mocked<typeof Story>
const mockSprint = Sprint as jest.Mocked<typeof Sprint>
const mockEpic = Epic as jest.Mocked<typeof Epic>

describe('CompletionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkStoryCompletion', () => {
    it('should complete story when all tasks are done', async () => {
      const storyId = 'story123'
      const mockStoryData = { _id: storyId, status: 'in_progress', sprint: 'sprint123' }
      const mockTasks = [
        { status: 'done' },
        { status: 'done' }
      ]

      mockStory.findById.mockResolvedValue(mockStoryData)
      mockTask.find.mockResolvedValue(mockTasks)
      mockStory.findByIdAndUpdate.mockResolvedValue(mockStoryData)

      await CompletionService.checkStoryCompletion(storyId)

      expect(mockStory.findByIdAndUpdate).toHaveBeenCalledWith(
        storyId,
        {
          status: 'completed',
          completedAt: expect.any(Date)
        }
      )
    })

    it('should not complete story when tasks are not all done', async () => {
      const storyId = 'story123'
      const mockStoryData = { _id: storyId, status: 'in_progress' }
      const mockTasks = [
        { status: 'done' },
        { status: 'in_progress' }
      ]

      mockStory.findById.mockResolvedValue(mockStoryData)
      mockTask.find.mockResolvedValue(mockTasks)

      await CompletionService.checkStoryCompletion(storyId)

      expect(mockStory.findByIdAndUpdate).not.toHaveBeenCalled()
    })
  })

  describe('checkSprintCompletion', () => {
    it('should complete sprint when all stories are completed', async () => {
      const sprintId = 'sprint123'
      const mockSprintData = { _id: sprintId, status: 'active' }
      const mockStories = [
        { status: 'completed', epic: 'epic123' },
        { status: 'completed', epic: 'epic123' }
      ]

      mockSprint.findById.mockResolvedValue(mockSprintData)
      mockStory.find.mockResolvedValue(mockStories)
      mockSprint.findByIdAndUpdate.mockResolvedValue(mockSprintData)

      await CompletionService.checkSprintCompletion(sprintId)

      expect(mockSprint.findByIdAndUpdate).toHaveBeenCalledWith(
        sprintId,
        {
          status: 'completed',
          actualEndDate: expect.any(Date)
        }
      )
    })
  })

  describe('checkEpicCompletion', () => {
    it('should complete epic when all sprints are completed', async () => {
      const epicId = 'epic123'
      const mockEpicData = { _id: epicId, status: 'in_progress' }
      const mockStories = [
        { sprint: 'sprint123' },
        { sprint: 'sprint123' }
      ]
      const mockSprints = [
        { status: 'completed' },
        { status: 'completed' }
      ]

      mockEpic.findById.mockResolvedValue(mockEpicData)
      mockStory.find.mockResolvedValue(mockStories)
      mockSprint.find.mockResolvedValue(mockSprints)
      mockEpic.findByIdAndUpdate.mockResolvedValue(mockEpicData)

      await CompletionService.checkEpicCompletion(epicId)

      expect(mockEpic.findByIdAndUpdate).toHaveBeenCalledWith(
        epicId,
        {
          status: 'completed',
          completedAt: expect.any(Date)
        }
      )
    })
  })

  describe('handleTaskStatusChange', () => {
    it('should trigger story completion check when task is completed', async () => {
      const taskId = 'task123'
      const mockTaskData = { _id: taskId, status: 'done', story: 'story123' }

      mockTask.findById.mockResolvedValue(mockTaskData)
      mockStory.findById.mockResolvedValue({ _id: 'story123', status: 'in_progress' })
      mockTask.find.mockResolvedValue([{ status: 'done' }])
      mockStory.findByIdAndUpdate.mockResolvedValue({})

      await CompletionService.handleTaskStatusChange(taskId)

      expect(mockTask.findById).toHaveBeenCalledWith(taskId)
    })
  })
})
