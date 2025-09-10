import styles from "./PhotoElement.module.css";

type PhotoElementProps = {
  filename: string;
};

const PhotoElement: React.FC<PhotoElementProps> = ({
  filename = "vite.svg",
}) => {
  return (
    <>
      <img src={`localhost:5173/images/${filename}`}></img>
    </>
  );
};

export default PhotoElement;
