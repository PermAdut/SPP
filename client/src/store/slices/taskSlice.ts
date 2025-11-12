/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type ITask } from "../../api/task.api";
import { client } from "../../graphql/apollo-client";
import {
  GET_TASKS,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  TOGGLE_TASK_COMPLETE,
} from "../../graphql/queries/tasks";

interface TaskState {
  isLoading: boolean;
  error: string | null;
  tasks: ITask[];
}

const initialState: TaskState = {
  isLoading: false,
  error: null,
  tasks: [],
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ITask[]>) => {
      state.tasks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTask: (state, action: PayloadAction<ITask>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<ITask>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setTasks,
  setLoading,
  setError,
  addTask,
  updateTask,
  removeTask,
} = taskSlice.actions;

export const getAllTasks = () => async (dispatch: any) => {
  dispatch(setLoading(true));
  try {
    console.log("Fetching tasks...");
    const { data } = await client.query<{ tasks: ITask[] }>({
      query: GET_TASKS,
      fetchPolicy: "network-only",
    });
    console.log("GraphQL response:", { data });
    if (data?.tasks) {
      dispatch(setTasks(data.tasks));
      console.log("Tasks loaded:", data.tasks.length);
    } else {
      console.log("No tasks data received");
    }
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    dispatch(setError(error.message || "Failed to fetch tasks"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createTask =
  (taskData: Partial<Omit<ITask, "id" | "createdAt">>) =>
  async (dispatch: any) => {
    dispatch(setLoading(true));
    try {
      // Убеждаемся, что поле files всегда присутствует
      const inputData = {
        ...taskData,
        files: taskData.files || [],
      };
      const { data } = await client.mutate<{ createTask: ITask[] }>({
        mutation: CREATE_TASK,
        variables: { input: inputData },
      });
      if (data?.createTask) {
        dispatch(setTasks(data.createTask));
      }
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to create task"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const updateTaskAction =
  (id: number, updates: Partial<Omit<ITask, "id" | "createdAt">>) =>
  async (dispatch: any) => {
    dispatch(setLoading(true));
    try {
      const { data } = await client.mutate<{ updateTask: ITask[] }>({
        mutation: UPDATE_TASK,
        variables: { id, input: updates },
      });
      if (data?.updateTask) {
        dispatch(setTasks(data.updateTask));
      }
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to update task"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const deleteTask = (id: number) => async (dispatch: any) => {
  dispatch(setLoading(true));
  try {
    await client.mutate({
      mutation: DELETE_TASK,
      variables: { id },
    });
    // После удаления обновляем список задач
    const { data } = await client.query<{ tasks: ITask[] }>({
      query: GET_TASKS,
      fetchPolicy: "network-only",
    });
    dispatch(setTasks(data?.tasks || []));
  } catch (error: any) {
    dispatch(setError(error.message || "Failed to delete task"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const toggleTaskComplete = (id: number) => async (dispatch: any) => {
  try {
    const { data } = await client.mutate<{ toggleTaskComplete: ITask[] }>({
      mutation: TOGGLE_TASK_COMPLETE,
      variables: { id },
    });
    if (data?.toggleTaskComplete) {
      dispatch(setTasks(data.toggleTaskComplete));
    }
  } catch (error: any) {
    dispatch(setError(error.message || "Failed to toggle task"));
    throw error;
  }
};

export default taskSlice.reducer;
