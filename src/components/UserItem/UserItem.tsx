import { IUser } from "../../api/user.api";
import styles from "./UserItem.module.css";
import PhotoUploader from "../PhotoUploader/PhotoUploader";
import { useAppDispatch } from "../../hooks/redux";
import { changeAdm, changeAddData } from "../../store/slice/userSlice";
import { useMemo, useState } from "react";
import Input from "../../ui/Input/Input";
import PhotoElement from "../PhotoElement/PhotoElement";

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
  const [newData, setNewData] = useState(additionalData || "");
  const [isAdminState, setIsAdminState] = useState<boolean>(isAdmin);

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
  return (
    <div className={styles.user_container}>
      <div className={styles.user_info}>
        <h3 className={styles.name}>Name: {name}</h3>
        <h4 className={styles.surname}>Surname: {surname}</h4>
        <strong className={styles.photo}>Photos:</strong>
      </div>
      {photoElements}
      <div className={styles.adminCheckbox}>
        <label>
          <Input
            id="admin"
            type="checkbox"
            defaultChecked={isAdmin}
            onChange={(e) => {
              dispatch(changeAdm({ id, status: e.target.checked }));
              setIsAdminState(e.target.checked);
            }}
          />
          Admin
        </label>
      </div>

      <PhotoUploader userId={id} />

      <div className={styles.additional_data}>
        <strong className={styles.additional_info}>Additional Info:</strong>
        <Input
          id="additionalData"
          type="text"
          value={newData}
          onChange={(e) => setNewData(e.target.value)}
          onBlur={() => {
            dispatch(changeAddData({ id, data: newData }));
          }}
          placeholder="Enter additional data"
        />
      </div>
    </div>
  );
}

export default UserItem;
