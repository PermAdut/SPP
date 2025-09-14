import { useState } from "react";
import { useAppDispatch } from "../../hooks/redux";
import { upload } from "../../store/slices/userSlice";

interface PhotoUploaderProps {
  userId: number;
}

function PhotoUploader({ userId }: PhotoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Пожалуйста, выберите файл для загрузки.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    dispatch(upload({ id: userId, photo: formData }))
      .unwrap()
      .then(() => {
        alert("Фото успешно загружено!");
      })
      .catch(() => {
        alert("Ошибка загрузки фото");
      });
  };

  return (
    <div style={{ marginTop: "12px" }}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: "8px" }}>
        Upload
      </button>
    </div>
  );
}

export default PhotoUploader;