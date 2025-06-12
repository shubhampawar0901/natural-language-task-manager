import axiosInstance from "./axiosInstance";
import type {
  ProcessRequest,
  ProcessResponse,
  TaskItem,
  TaskItemUpdate,
} from "../types/task";

export async function processTaskItems(
  request: ProcessRequest
): Promise<ProcessResponse> {
  const response = await axiosInstance.post<{ taskItems: TaskItem[] }>(
    "/process-request",
    request
  );
  return response.data;
}

export async function retrieveTaskItems(): Promise<TaskItem[]> {
  try {
    const response = await axiosInstance.get("/task-items");
    console.log("Retrieved task items response:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Error retrieving task items:", error);
    return [];
  }
}

export async function modifyTaskItem(
  id: string,
  modifications: TaskItemUpdate
): Promise<TaskItem> {
  const response = await axiosInstance.put<{ taskItem: TaskItem }>(
    `/task-items/${id}`,
    modifications
  );
  return response.data.taskItem;
}

export async function removeTaskItem(id: string): Promise<{ message: string }> {
  const response = await axiosInstance.delete<{ message: string }>(
    `/task-items/${id}`
  );
  return response.data;
}

// Legacy function aliases for backward compatibility
export const parseTasks = processTaskItems;
export const fetchTasks = retrieveTaskItems;
export const updateTask = modifyTaskItem;
export const deleteTask = removeTaskItem;
