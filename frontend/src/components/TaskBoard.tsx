import type { Task, TaskUpdate } from "../types/task"
import { TaskCard } from "./TaskCard"
import { Grid3X3, ListTodo, Sparkles } from "lucide-react"

interface TaskBoardProps {
  tasks: Task[]
  onUpdateTask: (id: string, updates: TaskUpdate) => void
  onDeleteTask: (id: string) => void
  isLoading?: boolean
}

export function TaskBoard({ tasks, onUpdateTask, onDeleteTask, isLoading }: TaskBoardProps) {
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-300/30">
            <Grid3X3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent">
              Action Items Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              {tasks.length} {tasks.length === 1 ? 'item' : 'items'} in your workspace
            </p>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl border border-violet-200">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">
              {tasks.filter(t => t.urgency_level === 'P1').length} Critical
            </span>
          </div>
        )}
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <TaskCard
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
              <ListTodo className="w-12 h-12 text-violet-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No action items yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first action item using the form above to get started organizing your tasks.
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-violet-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl">
            <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin"></div>
            <span className="text-violet-700 font-medium">Loading action items...</span>
          </div>
        </div>
      )}
    </div>
  )
}
