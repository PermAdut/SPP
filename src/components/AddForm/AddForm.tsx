import { useState } from "react";
import { useAppDispatch } from "../../hooks/redux";
import { createUser } from "../../store/slice/userSlice";
import styles from "./AddForm.module.css";
import { useNavigate } from "react-router-dom";

function AddForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [additionalData, setAdditionalData] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !surname.trim()) {
      setError("Name and surname are required");
      return;
    }
    setError(null);

    await dispatch(
      createUser({
        name: name.trim(),
        surname: surname.trim(),
        isAdmin,
        photo: [],
        additionalData: additionalData.trim() || undefined,
      })
    )
      .unwrap()
      .then(() => {
        navigate("/");
      })
      .catch(() => {
        setError("Error creating user");
      });
  };

  return (
    <div className={styles.form_container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Add User</h2>
        <div className={styles.field}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            className={styles.input}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter name"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="surname">Surname</label>
          <input
            id="surname"
            type="text"
            value={surname}
            className={styles.input}
            onChange={(e) => setSurname(e.target.value)}
            required
            placeholder="Enter surname"
          />
        </div>
        <div className={styles.field_checkbox}>
          <label htmlFor="isAdmin">Administrator</label>
          <input
            id="isAdmin"
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="additionalData">Additional Information</label>
          <input
            id="additionalData"
            type="text"
            value={additionalData}
            className={styles.input}
            onChange={(e) => setAdditionalData(e.target.value)}
            placeholder="For example: position"
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button className={styles.button} type="submit">
          Create User
        </button>
      </form>
    </div>
  );
}

export default AddForm;