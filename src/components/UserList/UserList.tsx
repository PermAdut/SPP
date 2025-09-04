import { useEffect, useState } from "react";
import {
  filterName,
  filterSurname,
  getAllUsers,
  upload,
} from "../../store/slice/userSlice";
import UserItem from "../UserItem/UserItem";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import useFilter from "../../hooks/useFilter";

function UserList() {
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((state) => state.user);

  const [nameInput, setNameInput] = useState("");
  const [surnameInput, setSurnameInput] = useState("");

  const searchName = useFilter(async (name:string) => {
    await dispatch(filterName({ name: name }));
  });
  const searchSurname = useFilter(async (surname: string) => {
    await dispatch(filterSurname({ surname: surname }));
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleUpload = (id: number, photo: string) => {
    dispatch(upload({ id, photo }));
  };

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by name"
          value={nameInput}
          onChange={(event) => {searchName(event)}}
        />
        <input
          type="text"
          placeholder="Search by surname"
          value={surnameInput}
          onChange={(event) => {searchSurname(event)}}
          style={{ marginLeft: "1rem" }}
        />
      </div>

      {users.map((user) => (
        <UserItem
          key={user.id}
          {...user}
          onUpload={handleUpload}
        />
      ))}
    </div>
  );
}

export default UserList;
