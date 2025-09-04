import { useState } from "react";

interface PhotoUploaderProps {
  userId: number;
  onUpload: (id: number, photo: string) => void;
}

function PhotoUploader({ userId, onUpload }: PhotoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files?.length){
      const file = event.target.files[0]
      setSelectedFile(file)
    } 
  }

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Пожалуйста, выберите файл для загрузки.');
      return;
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    onUpload(userId, selectedFile.name.trim());
  };


  return (
    <div style={{ marginTop: "12px" }}>
      <input type="file" onChange={handleFileChange}/>
      <button onClick={handleUpload} style={{ marginLeft: "8px" }}>
        Upload
      </button>
    </div>
  );
}

export default PhotoUploader;
