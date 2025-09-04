import { IUser } from "../../api/user.api";
import styles from "./UserItem.module.css";
import PhotoUploader from "../PhotoUploader/PhotoUploader";
import { useAppDispatch } from "../../hooks/redux";
import { changeAdm, changeAddData } from "../../store/slice/userSlice";
import { useState } from "react";

interface UserItemProps extends IUser {
  onUpload: (id: number, photo: string) => void;
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
  onUpload,
}: UserItemProps) {
  const dispatch = useAppDispatch();
  const [newData, setNewData] = useState(additionalData || "");
  return (
    <div className={styles.user_container}>
      <h3 className={styles.name}>Name: {name}</h3>
      <h4 className={styles.surname}>Surname: {surname}</h4>

      <div>
        <strong>Photos:</strong>
        {photo.map((el, index) => (
          <div key={index} className={styles.photoElement}>
            📷 {el}
          </div>
        ))}
      </div>

      <div className={styles.adminCheckbox}>
        <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={() => {
              dispatch(changeAdm({ id, status: !isAdmin }));
            }}
          />
          Admin
        </label>
      </div>

      <PhotoUploader userId={id} onUpload={onUpload} />

      <div className={styles.additionalData}>
        <label>
          <strong>Additional Info:</strong>
          <input
            type="text"
            value={newData}
            onChange={(e) => setNewData(e.target.value)}
            onBlur={() => dispatch(changeAddData({ id, data: newData }))}
            placeholder="Enter additional data"
          />
        </label>
      </div>
    </div>
  );
}

export default UserItem;
