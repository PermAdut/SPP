import styles from "./Input.module.css";

type InputProps<T extends string | number | readonly string[] | undefined> = {
  id:string;
  type: string;
  checked?:boolean;
  defaultChecked?:boolean;
  placeholder?: string;
  value?: T;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
};

function Input<T extends string | number | readonly string[] | undefined>({
  id,
  type,
  placeholder,
  value,
  defaultChecked,
  checked,
  onChange,
  onBlur,
}: InputProps<T>) {
  return (
    <>
      <input
        id={id}
        className={styles.input}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
      ></input>
    </>
  );
}

export default Input;
