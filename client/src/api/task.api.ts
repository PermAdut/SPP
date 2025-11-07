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
  files: string[];
  responsiblePhone: string | null;
}

export interface SocketResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FileUploadResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

export const uploadTaskFiles = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const token = localStorage.getItem("accessToken");
  const response = await fetch("http://localhost:3000/api/tasks/upload-files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result: FileUploadResponse = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Upload failed");
  }

  return result.data;
};
