import { useRef, useState } from "react";
import { ImagePlus, Leaf, Trash2, UploadCloud } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
interface ImageDropzoneProps {
  file: File | null;
  preview: string | null;
  onFileChange: (file: File | null, error?: string) => void;
}

export function ImageDropzone({ file, preview, onFileChange }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function acceptFile(nextFile?: File) {
    if (!nextFile) return;
    if (!["image/jpeg", "image/png"].includes(nextFile.type)) {
      onFileChange(null, "Choose a JPG or PNG image.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      onFileChange(null, "The image is larger than 5 MB. Choose a smaller file.");
      return;
    }
    onFileChange(nextFile);
  }

  return (
    <div
      className={`dropzone ${isDragging ? "is-dragging" : ""} ${preview ? "has-preview" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => { event.preventDefault(); setIsDragging(false); acceptFile(event.dataTransfer.files[0]); }}
    >
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg"
        onChange={(event) => acceptFile(event.target.files?.[0])}
        aria-label="Upload a plant leaf image"
      />
      {preview ? (
        <>
          <img className="image-preview" src={preview} alt="Selected plant leaf" />
          <div className="preview-shade" />
          <div className="preview-caption">
            <div className="preview-file-icon"><Leaf size={17} /></div>
            <div className="preview-file-copy">
              <strong>{file?.name}</strong>
              <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to scan` : "Ready to scan"}</span>
            </div>
            <button type="button" className="icon-button preview-remove" onClick={() => {
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }} aria-label="Remove selected image"><Trash2 size={17} /></button>
          </div>
        </>
      ) : (
        <button type="button" className="dropzone-prompt" onClick={() => inputRef.current?.click()}>
          <span className="upload-icon"><ImagePlus size={25} /></span>
          <strong>Drop your leaf image here</strong>
          <span className="upload-subtitle">or browse files from your device</span>
          <span className="upload-action"><UploadCloud size={15} /> Choose image</span>
          <span className="upload-hint">JPG or PNG · Maximum size 5 MB</span>
        </button>
      )}
    </div>
  );
}
