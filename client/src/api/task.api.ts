export interface ITask {
  id: string;
  title: string;
  description: string;
  userId: string | null;
  isPublic: boolean;
  completed: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high";
  deadline: string | null;
  category: string;
  tags: string[];
}
