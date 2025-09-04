import { useState } from "react";

interface PhotoUploaderProps {
  userId: number;
  onUpload: (id: number, photo: string) => void;
}

function PhotoUploader({ userId, onUpload }: PhotoUploaderProps) {
  const [photoName, setPhotoName] = useState("");

  const handleUpload = () => {
    if (photoName.trim()) {
      onUpload(userId, photoName.trim());
      setPhotoName("");
    }
  };

  return (
    <div style={{ marginTop: "12px" }}>
      <input
        type="text"
        placeholder="Enter photo name"
        value={photoName}
        onChange={(e) => setPhotoName(e.target.value)}
      />
      <button onClick={handleUpload} style={{ marginLeft: "8px" }}>
        Upload
      </button>
    </div>
  );
}

export default PhotoUploader;
