export interface TaskItem {
  id: string;
  item_title: string;
  assigned_to: string;
  deadline_text: string;
  urgency_level: "P1" | "P2" | "P3" | "P4";
  created_at: string;
  updated_at: string;
}

export interface ProcessRequest {
  text: string;
}

export interface ProcessResponse {
  taskItems: TaskItem[];
}

export interface TaskItemUpdate {
  item_title: string;
  assigned_to: string;
  deadline_text: string;
  urgency_level: TaskItem["urgency_level"];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Legacy type aliases for backward compatibility during transition
export type Task = TaskItem;
export type ParseRequest = ProcessRequest;
export type ParseResponse = ProcessResponse;
export type TaskUpdate = TaskItemUpdate;
