import { useState, useEffect } from "react";
import type { ITask } from "../../api/task.api";
import { uploadTaskFiles } from "../../api/task.api";
import { getUserIdFromToken } from "../../utils/jwt.util";
import styles from "./TaskForm.module.css";

interface TaskFormProps {
  task?: ITask;
  onSubmit: (
    taskData: Partial<Omit<ITask, "id" | "createdAt">>
  ) => Promise<void>;
  onCancel: () => void;
  isModal?: boolean;
}

function TaskForm({ task, onSubmit, onCancel, isModal = true }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [isPublic, setIsPublic] = useState(task?.isPublic ?? true);
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    task?.priority || "medium"
  );
  const [deadline, setDeadline] = useState(
    task?.deadline ? task.deadline.split("T")[0] : ""
  );
  const [category, setCategory] = useState(task?.category || "");
  const [tags, setTags] = useState(task?.tags?.join(", ") || "");
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState(task?.files || []);
  const [responsiblePhone, setResponsiblePhone] = useState(
    task?.responsiblePhone || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setIsPublic(task.isPublic);
      setPriority(task.priority);
      setDeadline(task.deadline ? task.deadline.split("T")[0] : "");
      setCategory(task.category);
      setTags(task.tags?.join(", ") || "");
      setExistingFiles(task.files || []);
      setResponsiblePhone(task.responsiblePhone || "");
      setFiles([]);
      setError(null);
      setIsSubmitting(false);
    } else {
      setTitle("");
      setDescription("");
      setIsPublic(true);
      setPriority("medium");
      setDeadline("");
      setCategory("");
      setTags("");
      setFiles([]);
      setExistingFiles([]);
      setResponsiblePhone("");
      setError(null);
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const validateForm = (): string | null => {
    if (!title.trim()) {
      return "Название задачи обязательно";
    }
    if (title.length > 200) {
      return "Название задачи не должно превышать 200 символов";
    }
    if (description && description.length > 1000) {
      return "Описание не должно превышать 1000 символов";
    }
    if (category && category.length > 50) {
      return "Категория не должна превышать 50 символов";
    }
    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    if (tagsArray.length > 10) {
      return "Максимум 10 тегов";
    }
    const totalFiles = existingFiles.length + files.length;
    if (totalFiles > 20) {
      return "Максимум 20 файлов всего";
    }
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        return "Дедлайн не может быть в прошлом";
      }
    }
    if (responsiblePhone && !/^\+375\d{9}$/.test(responsiblePhone)) {
      return "Неверный формат телефона. Используйте формат +375xxxxxxxxx";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      const userId = getUserIdFromToken();

      let allFiles = [...existingFiles];

      // Сначала загружаем файлы, если они выбраны
      if (files.length > 0) {
        const uploadedFiles = await uploadTaskFiles(files);
        allFiles = [...allFiles, ...uploadedFiles];
      }

      if (task) {
        // Для редактирования обновляем и основную информацию, и файлы одновременно
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          isPublic,
          priority,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          category: category.trim(),
          tags: tagsArray,
          files: allFiles,
          responsiblePhone: responsiblePhone.trim() || null,
        });
      } else {
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          isPublic,
          userId: isPublic ? null : userId || 1,
          completed: false,
          priority,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          category: category.trim() || "Общее",
          tags: tagsArray,
          files: allFiles,
          responsiblePhone: responsiblePhone.trim() || null,
        });
      }
      setIsSubmitting(false);
      onCancel();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка при сохранении задачи";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <div
      className={isModal ? styles.modal : styles.inlineForm}
      onClick={isModal ? (e) => e.stopPropagation() : undefined}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>
          {task ? "Редактировать задачу" : "Новая задача"}
        </h2>
        <button className={styles.closeButton} onClick={onCancel} type="button">
          ×
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Название *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="Введите название задачи"
            maxLength={200}
            required
          />
          <span className={styles.charCount}>{title.length}/200</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Описание
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            placeholder="Введите описание задачи"
            rows={4}
            maxLength={1000}
          />
          <span className={styles.charCount}>{description.length}/1000</span>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="priority" className={styles.label}>
              Приоритет *
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className={styles.select}
              required
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="deadline" className={styles.label}>
              Дедлайн
            </label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={styles.input}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>
            Категория
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.input}
            placeholder="Например: Работа, Личное, Учеба"
            maxLength={50}
          />
          <span className={styles.charCount}>{category.length}/50</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="tags" className={styles.label}>
            Теги (через запятую)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={styles.input}
            placeholder="важно, срочно, проект"
          />
          <span className={styles.hint}>
            Максимум 10 тегов. Разделяйте запятыми.
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="files" className={styles.label}>
            Добавить файлы
          </label>
          <input
            id="files"
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                const selectedFiles = Array.from(e.target.files);
                const maxNewFiles = 20 - existingFiles.length;
                if (selectedFiles.length > maxNewFiles) {
                  alert(
                    `Можно выбрать максимум ${maxNewFiles} дополнительных файлов`
                  );
                  return;
                }
                setFiles(selectedFiles);
              }
            }}
            className={styles.input}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <span className={styles.hint}>
            Выберите файлы для загрузки (максимум {20 - existingFiles.length}{" "}
            дополнительных файлов)
          </span>
          {existingFiles.length > 0 && (
            <div className={styles.existingFiles}>
              <p>Существующие файлы:</p>
              <ul>
                {existingFiles.map((file, index) => (
                  <li key={index}>
                    <a
                      href={`http://localhost:3000/images/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="responsiblePhone" className={styles.label}>
            Телефон ответственного
          </label>
          <input
            id="responsiblePhone"
            type="text"
            value={responsiblePhone}
            onChange={(e) => setResponsiblePhone(e.target.value)}
            className={styles.input}
            placeholder="+375291234567"
            pattern="\+375\d{9}"
          />
          <span className={styles.hint}>Формат: +375xxxxxxxxx</span>
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>Публичная задача</span>
          </label>
          <p className={styles.hint}>
            Публичные задачи видны всем пользователям
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Сохранение..." : task ? "Сохранить" : "Создать"}
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className={styles.overlay} onClick={onCancel}>
        {formContent}
      </div>
    );
  }

  return formContent;
}

export default TaskForm;
