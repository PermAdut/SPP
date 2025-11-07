import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  UPDATE_TASK,
  DELETE_TASK,
  TOGGLE_TASK_COMPLETE,
  GET_TASKS,
} from "../../graphql/queries";
import { ITask } from "../../api/task.api";
import TaskForm from "../TaskForm/TaskForm";
import styles from "./TaskItem.module.css";

interface TaskItemProps {
  task: ITask;
}

function TaskItem({ task }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [updateTaskMutation] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });

  const [deleteTaskMutation] = useMutation(DELETE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });

  const [toggleCompleteMutation] = useMutation(TOGGLE_TASK_COMPLETE, {
    refetchQueries: [{ query: GET_TASKS }],
  });

  const handleToggleComplete = async () => {
    try {
      await toggleCompleteMutation({
        variables: { id: task.id.toString() },
      });
    } catch (error: any) {
      alert(error.message || "Ошибка при изменении статуса задачи");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Удалить задачу?")) {
      try {
        await deleteTaskMutation({
          variables: { id: task.id.toString() },
        });
      } catch (error: any) {
        alert(error.message || "Ошибка при удалении задачи");
      }
    }
  };

  const handleUpdate = async (updates: Partial<Omit<ITask, "id" | "createdAt">>) => {
    try {
      await updateTaskMutation({
        variables: {
          id: task.id.toString(),
          input: {
            title: updates.title,
            description: updates.description,
            isPublic: updates.isPublic,
            priority: updates.priority,
            deadline: updates.deadline,
            category: updates.category,
            tags: updates.tags,
          },
        },
      });
      setIsEditing(false);
    } catch (error: any) {
      throw error;
    }
  };

  if (isEditing) {
    return (
      <TaskForm
        task={task}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
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
  );
}

export default TaskItem;
