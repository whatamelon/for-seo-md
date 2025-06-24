import React, { useRef, useState, useEffect } from "react";

interface ImageUploaderProps {
  onImageChange?: (src: string, file?: File) => void;
}

// Electron 임시 파일 저장 함수 호출용 타입 선언 (preload.ts, main.ts에도 추가 필요)
declare global {
  interface ElectronAPI {
    saveTempImage?: (data: ArrayBuffer, ext: string) => Promise<string>;
    downloadImageToTemp?: (url: string, ext: string) => Promise<string>;
    readFileAsDataUrl?: (path: string) => Promise<string>;
  }
}

export default function ImageUploader({ onImageChange }: ImageUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
        setUrlInput("");
        if (onImageChange) onImageChange(ev.target?.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };

  // 드래그앤드랍 핸들러
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
        setUrlInput("");
        if (onImageChange) onImageChange(ev.target?.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  // URL 입력 핸들러
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    setError(null);
  };
  const handleUrlLoad = async () => {
    if (!urlInput.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
      setError("유효한 이미지 URL을 입력하세요.");
      return;
    }
    setError(null);
    try {
      const extMatch = urlInput.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
      if (window.electronAPI?.downloadImageToTemp) {
        const tempPath = await window.electronAPI.downloadImageToTemp(urlInput, ext);
        setImageSrc(tempPath);  
        if (onImageChange) onImageChange(tempPath);
      } else {
        // Electron 환경이 아니면 기존 방식 fallback
        const res = await fetch(urlInput);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImageSrc(ev.target?.result as string);
          if (onImageChange) onImageChange(ev.target?.result as string);
        };

        reader.readAsDataURL(blob);
      }
    } catch (e) {
      setError("이미지 다운로드/저장 실패: " + (e instanceof Error ? e.message : e));
    }
  };

  // imageSrc가 임시 파일 경로일 때 DataURL로 변환
  useEffect(() => {
    if (imageSrc && typeof imageSrc === "string" && imageSrc.startsWith("/")) {
      window.electronAPI?.readFileAsDataUrl?.(imageSrc).then(setPreviewUrl);
    } else {
      setPreviewUrl(imageSrc);
    }
  }, [imageSrc]);

  return (
    <div className="flex flex-col gap-2 items-center w-full max-w-md mx-auto">

      <h2 className="text-lg font-bold flex items-start justify-start w-full">1. Upload Image</h2>
      {/* 파일 선택 및 드래그앤드랍 */}
      <label
        htmlFor="image-upload"
        tabIndex={0}
        className={`w-full h-36 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 ${
          dragActive ? "border-primary" : "border-gray-300 hover:border-primary/70"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="이미지 파일을 선택하거나 드래그 앤 드랍하세요"
      >
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke="currentColor" strokeWidth="1.5" d="M12 16v-8m0 0-3 3m3-3 3 3M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5"/>
        </svg>
        <span className="mt-2 text-sm text-gray-600 select-none">
          이미지를 <span className="font-semibold text-primary">여기로 드래그</span>하거나 <span className="underline">클릭</span>해서 업로드
        </span>
      </label>
      <div className="w-full flex items-center justify-center">
        <span>또는</span>
      </div>
      <div className="w-full flex items-center gap-2">
        <input
          type="text"
          className="flex-1 rounded-md border border-gray-300 bg-white/80 dark:bg-gray-900/60 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
          placeholder="이미지 URL 입력 (예: https://...)"
          value={urlInput}
          onChange={handleUrlChange}
          aria-label="이미지 URL 입력"
        />
        <button
          type="button"
          className="px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 transition"
          onClick={handleUrlLoad}
          aria-label="이미지 URL로 불러오기"
        >
          URL 불러오기
        </button>
      </div>
      {error && (
        <div className="w-full text-red-500 text-xs text-left px-1">⚠ {error}</div>
      )}
      {/* 이미지 미리보기 */}
      {previewUrl && (
        <div className="w-full flex flex-col items-center mt-4 gap-2">
          <img
            src={previewUrl}
            alt="업로드된 이미지 미리보기"
            className="max-w-full max-h-64 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            style={{ objectFit: "contain" }}
          />
          <span className="text-xs text-gray-400">
            미리보기 | {imageSrc?.startsWith("data:") ? "로컬에서 불러옴" : imageSrc?.startsWith("http") ? "URL에서 불러옴" : imageSrc?.startsWith("/") ? "임시 파일에서 불러옴" : ""}
          </span>
          {imageSrc?.startsWith("/") && (
            <span className="text-xs text-gray-400">임시 파일 경로: {imageSrc}</span>
          )}
        </div>
      )}
    </div>
  );
} 