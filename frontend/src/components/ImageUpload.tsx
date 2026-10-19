import React from 'react';
import { Upload, XCircle } from 'lucide-react';
import { cn } from '../utils';

interface ImageUploadProps {
  image: File | null;
  setImage: (file: File | null) => void;
  preview: string | null;
  setPreview: (url: string | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const ImageUpload = ({ image, setImage, preview, setPreview, error, setError }: ImageUploadProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validImageTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a correct image file (JPEG or PNG).");
        setPreview(null);
        setImage(null);
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image too large. Max 5MB.");
        setPreview(null);
        setImage(null);
        e.target.value = '';
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  return (
    <div className="relative group">
      <div className={cn(
        "aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden relative bg-slate-50 dark:bg-slate-900/50",
        preview ? "border-transparent shadow-inner" : "border-slate-300 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"
      )}>
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => {setPreview(null); setImage(null);}}
              className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-rose-500 rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-all duration-300"
            >
              <XCircle size={20} />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center cursor-pointer p-12 text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Upload className="w-8 h-8 text-primary-500" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-400 mb-1">Click to upload or drag & drop</span>
            <span className="text-xs text-slate-400">Supports JPEG, PNG (Max 5MB)</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageUpload}
              data-testid="image-upload-input"
            />
          </label>
        )}
      </div>
    </div>
  );
};