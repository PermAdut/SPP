import { useState } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import {
  GET_TASKS,
  CREATE_TASK,
  TASK_UPDATED_SUBSCRIPTION,
  TASK_DELETED_SUBSCRIPTION,
} from "../../graphql/queries";
import { ITask } from "../../api/task.api";
import TaskItem from "../TaskItem/TaskItem";
import TaskForm from "../TaskForm/TaskForm";
import styles from "./TaskList.module.css";

function TaskList() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "public" | "private" | "completed">("all");

  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    errorPolicy: "all",
  });

  const [createTaskMutation] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
    onCompleted: () => {
      setShowForm(false);
    },
  });

  // Подписка на обновления задач
  useSubscription(TASK_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.taskUpdated) {
        refetch();
      }
    },
  });

  // Подписка на удаление задач
  useSubscription(TASK_DELETED_SUBSCRIPTION, {
    onData: () => {
      refetch();
    },
  });

  const handleCreateTask = async (taskData: Omit<ITask, "id" | "createdAt">) => {
    try {
      await createTaskMutation({
        variables: {
          input: {
            title: taskData.title,
            description: taskData.description,
            isPublic: taskData.isPublic,
            priority: taskData.priority,
            deadline: taskData.deadline,
            category: taskData.category,
            tags: taskData.tags,
          },
        },
      });
    } catch (error: any) {
      throw error;
    }
  };

  const tasks: ITask[] = data?.tasks || [];
  const filteredTasks = tasks.filter((task) => {
    if (filter === "public") return task.isPublic;
    if (filter === "private") return !task.isPublic;
    if (filter === "completed") return task.completed;
    return true;
  });

  const publicTasks = filteredTasks.filter((t) => t.isPublic);
  const privateTasks = filteredTasks.filter((t) => !t.isPublic);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Задачи</h1>
        <div className={styles.actions}>
          <button className={styles.addButton} onClick={() => setShowForm(true)}>
            + Новая задача
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
          onClick={() => setFilter("all")}
        >
          Все
        </button>
        <button
          className={`${styles.filterButton} ${filter === "public" ? styles.active : ""}`}
          onClick={() => setFilter("public")}
        >
          Публичные
        </button>
        <button
          className={`${styles.filterButton} ${filter === "private" ? styles.active : ""}`}
          onClick={() => setFilter("private")}
        >
          Индивидуальные
        </button>
        <button
          className={`${styles.filterButton} ${filter === "completed" ? styles.active : ""}`}
          onClick={() => setFilter("completed")}
        >
          Выполненные
        </button>
      </div>

      {loading && <div className={styles.loading}>Загрузка...</div>}
      {error && <div className={styles.error}>Ошибка: {error.message}</div>}

      <div className={styles.tasksContainer}>
        {publicTasks.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🌐 Публичные задачи</h2>
            <div className={styles.taskGrid}>
              {publicTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {privateTasks.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🔒 Индивидуальные задачи</h2>
            <div className={styles.taskGrid}>
              {privateTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && !loading && (
          <div className={styles.empty}>Нет задач</div>
        )}
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default TaskList;
