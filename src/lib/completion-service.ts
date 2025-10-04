import { Task } from '@/models/Task'
import { Story } from '@/models/Story'
import { Sprint } from '@/models/Sprint'
import { Epic } from '@/models/Epic'

export class CompletionService {
  /**
   * Check and update story completion based on its tasks
   */
  static async checkStoryCompletion(storyId: string): Promise<void> {
    try {
      const story = await Story.findById(storyId)
      if (!story) return

      // Get all tasks for this story
      const tasks = await Task.find({ story: storyId })
      
      if (tasks.length === 0) return

      // Check if all tasks are completed (status = 'done')
      const allTasksCompleted = tasks.every(task => task.status === 'done')
      
      if (allTasksCompleted && story.status !== 'completed') {
        await Story.findByIdAndUpdate(storyId, {
          status: 'completed',
          completedAt: new Date()
        })
        
        // Check if sprint should be completed
        if (story.sprint) {
          await this.checkSprintCompletion(story.sprint.toString())
        }
      }
    } catch (error) {
      console.error('Error checking story completion:', error)
    }
  }

  /**
   * Check and update sprint completion based on its stories
   */
  static async checkSprintCompletion(sprintId: string): Promise<void> {
    try {
      const sprint = await Sprint.findById(sprintId)
      if (!sprint) return

      // Get all stories for this sprint
      const stories = await Story.find({ sprint: sprintId })
      
      if (stories.length === 0) return

      // Check if all stories are completed
      const allStoriesCompleted = stories.every(story => story.status === 'completed')
      
      if (allStoriesCompleted && sprint.status !== 'completed') {
        await Sprint.findByIdAndUpdate(sprintId, {
          status: 'completed',
          actualEndDate: new Date()
        })
        
        // Check if epic should be completed
        const epicIds = [...new Set(stories.map(story => story.epic).filter(Boolean))]
        for (const epicId of epicIds) {
          if (epicId) {
            await this.checkEpicCompletion(epicId.toString())
          }
        }
      }
    } catch (error) {
      console.error('Error checking sprint completion:', error)
    }
  }

  /**
   * Check and update epic completion based on its sprints
   */
  static async checkEpicCompletion(epicId: string): Promise<void> {
    try {
      const epic = await Epic.findById(epicId)
      if (!epic) return

      // Get all stories for this epic
      const stories = await Story.find({ epic: epicId })
      
      if (stories.length === 0) return

      // Get all sprints that contain stories from this epic
      const sprintIds = [...new Set(stories.map(story => story.sprint).filter(Boolean))]
      
      if (sprintIds.length === 0) return

      // Get all sprints for this epic
      const sprints = await Sprint.find({ _id: { $in: sprintIds } })
      
      // Check if all sprints are completed
      const allSprintsCompleted = sprints.every(sprint => sprint.status === 'completed')
      
      if (allSprintsCompleted && epic.status !== 'completed') {
        await Epic.findByIdAndUpdate(epicId, {
          status: 'completed',
          completedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Error checking epic completion:', error)
    }
  }

  /**
   * Main method to check completion when a task status changes
   */
  static async handleTaskStatusChange(taskId: string): Promise<void> {
    try {
      const task = await Task.findById(taskId)
      if (!task) return

      // If task is completed, check story completion
      if (task.status === 'done' && task.story) {
        await this.checkStoryCompletion(task.story.toString())
      }
    } catch (error) {
      console.error('Error handling task status change:', error)
    }
  }

  /**
   * Check completion for a specific project
   */
  static async checkProjectCompletion(projectId: string): Promise<void> {
    try {
      // Get all stories for this project
      const stories = await Story.find({ project: projectId })
      
      for (const story of stories) {
        if (story.sprint) {
          await this.checkSprintCompletion(story.sprint.toString())
        }
        
        if (story.epic) {
          await this.checkEpicCompletion(story.epic.toString())
        }
      }
    } catch (error) {
      console.error('Error checking project completion:', error)
    }
  }
}
