import { useEffect, useMemo, useState } from "react";
import {
  filterName,
  filterSurname,
  getAllUsers,
  upload,
} from "../../store/slice/userSlice";
import UserItem from "../UserItem/UserItem";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import styles from "./UserList.module.css";
import Input from "../../ui/Input/Input";
import useDebounce from "../../hooks/useDobounce";

function UserList() {
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((state) => state.user);

  const [nameInput, setNameInput] = useState("");
  const [surnameInput, setSurnameInput] = useState("");

  const searchName = useDebounce(async (name: string) => {
    await dispatch(filterName({ name: name }));
  }, 300);
  const searchSurname = useDebounce(async (surname: string) => {
    await dispatch(filterSurname({ surname: surname }));
  }, 300);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleUpload = (id: number, photo: string) => {
    dispatch(upload({ id, photo }));
  };

  const usersMemo = useMemo(
    () =>
      users.map((user) => (
        <UserItem key={user.id} {...user} onUpload={handleUpload} />
      )),
    [users]
  );

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className={styles.search_container}>
        <Input
          id="name"
          type="text"
          placeholder="Search by name"
          value={nameInput}
          onChange={(event) => {
            setNameInput(event.target.value);
            searchName(event);
          }}
        />
        <Input
          id="surname"
          type="text"
          placeholder="Search by surname"
          value={surnameInput}
          onChange={(event) => {
            setSurnameInput(event.target.value);
            searchSurname(event);
          }}
        />
      </div>
      {usersMemo}
    </div>
  );
}

export default UserList;
