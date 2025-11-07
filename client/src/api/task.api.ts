export interface ITask {
  id: number;
  title: string;
  description: string;
  userId: number | null;
  isPublic: boolean;
  completed: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high";
  deadline: string | null;
  category: string;
  tags: string[];
}

export interface SocketResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
