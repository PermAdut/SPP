import { useEffect, useMemo, useState } from "react";
import {
  filterName,
  filterSurname,
  getAllUsers,
} from "../../store/slices/userSlice";
import UserItem from "../UserItem/UserItem";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import styles from "./UserList.module.css";
import Input from "../../ui/Input/Input";
import useDebounce from "../../hooks/useDobounce";
import { useNavigate } from "react-router";

function UserList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, error } = useAppSelector((state) => state.user);

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

  const usersMemo = useMemo(
    () => users.map((user) => <UserItem key={user.id} {...user} />),
    [users]
  );
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className={styles.list_container}>
        <button className={styles.add_btn} onClick={() => navigate("/new")}>Add new user</button>
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
