import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { getAllTasks, createTask, setTasks } from "../../store/slices/taskSlice";
import { ITask } from "../../api/task.api";
import TaskItem from "../TaskItem/TaskItem";
import TaskForm from "../TaskForm/TaskForm";
import styles from "./TaskList.module.css";
import socketService from "../../services/socket.service";

function TaskList() {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector((state) => state.task);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "public" | "private" | "completed">("all");

  useEffect(() => {
    dispatch(getAllTasks());
    
    // Подписываемся на обновления задач
    const socket = socketService.getSocket();
    if (socket) {
      const handleUpdate = (tasks: ITask[]) => {
        dispatch(setTasks(tasks));
      };
      socket.on('tasks:update', handleUpdate);
      
      return () => {
        socket.off('tasks:update', handleUpdate);
      };
    }
  }, [dispatch]);

  const handleCreateTask = async (taskData: Omit<ITask, "id" | "createdAt">) => {
    try {
      await dispatch(createTask(taskData));
      // Форма закроется автоматически в TaskForm при успехе
    } catch (error: any) {
      // Ошибка будет показана в форме через TaskForm
      throw error; // Пробрасываем ошибку в форму
    }
  };

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

      {isLoading && <div className={styles.loading}>Загрузка...</div>}

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

        {filteredTasks.length === 0 && !isLoading && (
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

