import React, { useState } from "react";
import ImageUploader from "@/components/feat/ImageUploader";
import MarketResizePanel from "@/components/feat/MarketResizePanel";

export default function ImageResizePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // ImageUploader에서 이미지 파일/URL을 받아오는 콜백
  const handleImageChange = (src: string, file?: File) => {
    setImageSrc(src)
    setImageFile(file || null)
  };

  return (
    <div className="flex flex-col items-center min-h-fit gap-10 mt-4 pb-10">
      <ImageUploader onImageChange={handleImageChange} />
      <MarketResizePanel imageSrc={imageSrc} imageFile={imageFile} />
    </div>
  );
} 