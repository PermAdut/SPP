import { type IUser } from "../../api/user.api";
import styles from "./UserItem.module.css";
import PhotoUploader from "../PhotoUploader/PhotoUploader";
import { useAppDispatch } from "../../hooks/redux";
import { deleteUser } from "../../store/slices/userSlice";
import { useMemo, useState } from "react";
import PhotoElement from "../PhotoElement/PhotoElement";
import EditForm from "../EditForm/EditForm";
interface UserItemProps extends IUser {
  filterName?: string;
  filterSurname?: string;
}

function UserItem({
  id,
  name,
  surname,
  isAdmin,
  photo,
  additionalData,
}: UserItemProps) {
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);

  const photoElements = useMemo(
    () => (
      <div className={styles.photo_info}>
        {photo.map((el, index) => (
          <PhotoElement key={index} filename={el} />
        ))}
      </div>
    ),
    [photo]
  );

  const handleDelete = () => {
    if (window.confirm("Delete user?")) {
      dispatch(deleteUser(id));
    }
  };
  return (
    <div className={styles.user_container}>
      <div className={styles.user_info}>
        <h3 className={styles.name}>Name: {name}</h3>
        <h4 className={styles.surname}>Surname: {surname}</h4>
        <strong className={styles.photo}>Photos:</strong>
      </div>
      {photoElements}
      <div className={styles.adminCheckbox}>
        <h2 className={styles.additional_text}>{isAdmin ? "Admin" : "User"}</h2>
      </div>

      <PhotoUploader userId={id} />

      <div className={styles.additional_data}>
        <strong className={styles.additional_info}>Additional Info:</strong>
        <h2 className={styles.additional_text}>{additionalData}</h2>
      </div>
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          title="Редактировать"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.3rem",
          }}
          onClick={() => setEditMode(true)}
        >
          ✏️
        </button>
        <button
          title="Удалить"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.3rem",
          }}
          onClick={handleDelete}
        >
          🗑️
        </button>
      </div>
      {editMode && (
        <EditForm
          user={{ id, name, surname, isAdmin }}
          onClose={() => setEditMode(false)}
        />
      )}
    </div>
  );
}

export default UserItem;
