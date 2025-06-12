import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { InputForm } from './components/InputForm'
import { TaskBoard } from './components/TaskBoard'
import type { ProcessRequest, Task, TaskUpdate } from './types/task'
import { processTaskItems, retrieveTaskItems, modifyTaskItem, removeTaskItem } from './api/tasks'

export default function App() {
  const queryClient = useQueryClient()

  // Retrieve task items
  const { data: taskItems = [], isLoading: isLoadingTaskItems } = useQuery<Task[]>({
    queryKey: ['taskItems'],
    queryFn: retrieveTaskItems,
    initialData: []
  })

  // Process task items mutation
  const { mutate: processTaskItemsMutation, isPending: isProcessingTaskItems } = useMutation({
    mutationFn: (request: ProcessRequest) => processTaskItems(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskItems'] })
    }
  })

  // Modify task item mutation
  const { mutate: modifyTaskItemMutation } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) =>
      modifyTaskItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskItems'] })
    }
  })

  // Remove task item mutation
  const { mutate: removeTaskItemMutation } = useMutation({
    mutationFn: (id: string) => removeTaskItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskItems'] })
    }
  })

  const handleProcessTaskItems = (request: ProcessRequest) => {
    processTaskItemsMutation(request)
  }

  const handleModifyTaskItem = (id: string, updates: TaskUpdate) => {
    modifyTaskItemMutation({ id, updates })
  }

  const handleRemoveTaskItem = (id: string) => {
    removeTaskItemMutation(id)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-violet-50/30 to-purple-50/50 py-8 px-4 sm:px-6">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-300/15 to-violet-300/15 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        <InputForm onParse={handleProcessTaskItems} isLoading={isProcessingTaskItems} />
        <TaskBoard
          tasks={taskItems}
          onUpdateTask={handleModifyTaskItem}
          onDeleteTask={handleRemoveTaskItem}
          isLoading={isLoadingTaskItems}
        />
      </div>
    </main>
  )
}
