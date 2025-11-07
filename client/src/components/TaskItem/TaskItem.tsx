import { useState } from "react";
import { useAppDispatch } from "../../hooks/redux";
import { deleteTask, toggleTaskComplete, updateTaskAction } from "../../store/slices/taskSlice";
import { ITask } from "../../api/task.api";
import TaskForm from "../TaskForm/TaskForm";
import styles from "./TaskItem.module.css";

interface TaskItemProps {
  task: ITask;
}

function TaskItem({ task }: TaskItemProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleComplete = () => {
    dispatch(toggleTaskComplete(task.id));
  };

  const handleDelete = async () => {
    if (window.confirm("Удалить задачу?")) {
      try {
        await dispatch(deleteTask(task.id));
      } catch (error: any) {
        alert(error.message || "Ошибка при удалении задачи");
      }
    }
  };

  const handleUpdate = async (updates: Partial<Omit<ITask, "id" | "createdAt">>) => {
    try {
      await dispatch(updateTaskAction(task.id, updates));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
      const errorMessage = error instanceof Error ? error.message : "Ошибка при обновлении задачи";
      throw new Error(errorMessage);
    }
  };

  return (
    <>
      {isEditing && (
        <TaskForm
          task={task}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isModal={true}
        />
      )}
      <div className={`${styles.taskCard} ${task.completed ? styles.completed : ""}`}>
      <div className={styles.taskHeader}>
        <div className={styles.taskMeta}>
          <span className={styles.taskType}>
            {task.isPublic ? "🌐 Публичная" : "🔒 Индивидуальная"}
          </span>
          <span className={styles.taskDate}>
            {new Date(task.createdAt).toLocaleDateString("ru-RU")}
          </span>
        </div>
        <div className={styles.taskActions}>
          <button
            className={styles.editButton}
            onClick={() => setIsEditing(true)}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>

      <h3 className={styles.taskTitle}>{task.title}</h3>
      {task.description && (
        <p className={styles.taskDescription}>{task.description}</p>
      )}

      <div className={styles.taskInfo}>
        <div className={styles.infoRow}>
          <span className={`${styles.priority} ${styles[task.priority]}`}>
            {task.priority === 'high' ? '🔴 Высокий' : task.priority === 'medium' ? '🟡 Средний' : '🟢 Низкий'}
          </span>
          {task.category && (
            <span className={styles.category}>{task.category}</span>
          )}
        </div>
        {task.deadline && (
          <div className={styles.deadline}>
            📅 {new Date(task.deadline).toLocaleDateString("ru-RU")}
            {new Date(task.deadline) < new Date() && !task.completed && (
              <span className={styles.overdue}>Просрочено</span>
            )}
          </div>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className={styles.tags}>
            {task.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}
        {task.files && task.files.length > 0 && (
          <div className={styles.files}>
            📎 {task.files.join(', ')}
          </div>
        )}
        {task.responsiblePhone && (
          <div className={styles.phone}>
            📞 {task.responsiblePhone}
          </div>
        )}
      </div>

      <div className={styles.taskFooter}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>
            {task.completed ? "Выполнено" : "Не выполнено"}
          </span>
        </label>
      </div>
    </div>
    </>
  );
}

export default TaskItem;

