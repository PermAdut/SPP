import styles from "./PhotoElement.module.css";

type PhotoElementProps = {
  filename: string;
};

const PhotoElement: React.FC<PhotoElementProps> = ({ filename }) => {
  return (
    <div className={styles.photo_wrapper}>
      <img className={styles.photo_img} src={`http://127.0.0.1:5173/images/${filename}`} />
    </div>
  );
};

export default PhotoElement;
