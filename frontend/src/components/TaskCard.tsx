import { useState } from "react"
import type { Task, TaskUpdate } from "../types/task"
import { PriorityBadge } from "./PriorityBadge"
import { formatDateTime } from "../utils/dateFormat"
import { Calendar, User, Edit3, Check, X, Trash2, AlertCircle, Clock, Target } from "lucide-react"

interface TaskCardProps {
  task: Task
  onUpdate: (id: string, updates: TaskUpdate) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editedTask, setEditedTask] = useState<TaskUpdate>({
    item_title: task.item_title,
    assigned_to: task.assigned_to,
    deadline_text: task.deadline_text || '',
    urgency_level: task.urgency_level
  })
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    try {
      // Validate item title
      if (!editedTask.item_title.trim()) {
        throw new Error("Action item title is required")
      }

      // Validate assigned person
      if (!editedTask.assigned_to.trim()) {
        throw new Error("Assigned person is required")
      }

      // Validate deadline
      if (!editedTask.deadline_text) {
        throw new Error("Deadline is required")
      }

      // Validate urgency level
      if (!['P1', 'P2', 'P3', 'P4'].includes(editedTask.urgency_level)) {
        throw new Error("Invalid urgency level")
      }

      onUpdate(task.id, editedTask)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid action item data")
    }
  }

  const handleCancel = () => {
    setEditedTask({
      item_title: task.item_title,
      assigned_to: task.assigned_to,
      deadline_text: task.deadline_text || '',
      urgency_level: task.urgency_level
    })
    setIsEditing(false)
    setError(null)
  }

  const handleDelete = () => {
    onDelete(task.id)
    setShowDeleteModal(false)
  }

  return (
    <>
      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-violet-200/50 p-6 hover:shadow-2xl hover:shadow-violet-300/20 hover:border-violet-400/60 transition-all duration-300 hover:-translate-y-2 w-full relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <PriorityBadge priority={editedTask.urgency_level} />
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="opacity-60 group-hover:opacity-100 p-2 rounded-xl hover:bg-violet-100/80 transition-all duration-200 hover:scale-110"
                aria-label="Edit action item"
              >
                <Edit3 className="w-4 h-4 text-violet-600" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="opacity-60 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-100/80 transition-all duration-200 hover:scale-110"
                aria-label="Delete action item"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-xl border border-red-200">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Action Item Title</label>
                <input
                  type="text"
                  value={editedTask.item_title}
                  onChange={(e) => setEditedTask({ ...editedTask, item_title: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-violet-200 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-violet-300/30 focus:border-violet-400 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={editedTask.assigned_to}
                  onChange={(e) => setEditedTask({ ...editedTask, assigned_to: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-violet-200 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-violet-300/30 focus:border-violet-400 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                <input
                  type="datetime-local"
                  value={editedTask.deadline_text ? editedTask.deadline_text.slice(0, 16) : ''}
                  onChange={(e) => setEditedTask({ ...editedTask, deadline_text: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-3 bg-white border-2 border-violet-200 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-violet-300/30 focus:border-violet-400 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level</label>
                <select
                  value={editedTask.urgency_level}
                  onChange={(e) => setEditedTask({ ...editedTask, urgency_level: e.target.value as Task["urgency_level"] })}
                  className="w-full px-4 py-3 bg-white border-2 border-violet-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-violet-300/30 focus:border-violet-400 transition-all duration-200"
                >
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Medium</option>
                  <option value="P4">P4 - Low</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-400 hover:to-purple-500 transition-all duration-200 w-full sm:w-auto hover:scale-105 shadow-lg shadow-violet-300/30"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200 w-full sm:w-auto hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-violet-700 transition-colors duration-200">
                {task.item_title}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <User className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="font-medium">{task.assigned_to}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">{task.deadline_text || 'No deadline set'}</span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="pt-3 border-t border-violet-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Action Item</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-md">
          <div className="bg-white p-8 rounded-3xl border-2 border-violet-200 shadow-2xl shadow-violet-300/20 max-w-md w-full mx-4 relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-50 opacity-50"></div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Action Item</h3>
                <p className="text-gray-600">Are you sure you want to delete this action item? This action cannot be undone.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200 hover:scale-105"
                >
                  Keep Item
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-400 hover:to-pink-500 transition-all duration-200 hover:scale-105 shadow-lg shadow-red-300/30"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
