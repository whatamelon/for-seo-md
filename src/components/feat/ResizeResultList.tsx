import React from "react";
import { FolderOpen, Copy } from "lucide-react";
import { toast } from "sonner";

interface ResizeResult {
  market: string;
  filePath: string;
  fileName: string;
  width: number;
  height: number;
  size: number; // bytes
}

export default function ResizeResultList({ results }: { results: ResizeResult[] }) {
  const handleOpen = (filePath: string) => {
    window.electronAPI?.openFileLocation?.(filePath);
  };
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast(`"${text}" 복사 완료`);
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold">3. Resize Result</h2>
      <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
        {results.map(r => (
          <div key={r.filePath} className="border rounded-lg p-3 bg-muted/40 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">{r.market}</span>
              <button title="폴더 열기" onClick={() => handleOpen(r.filePath)}>
                <FolderOpen size={18} className="text-primary" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs break-all">{r.fileName}</span>
              <button title="파일명 복사" onClick={() => handleCopy(r.fileName)}>
                <Copy size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 truncate">{r.filePath}</span>
              <button title="경로 복사" onClick={() => handleCopy(r.filePath)}>
                <Copy size={14} />
              </button>
            </div>
            <div className="flex gap-4 mt-1 text-xs">
              <span>크기: <b>{r.width}x{r.height}px</b></span>
              <span>용량: <b>{r.size/1024/1024 > 1 ? (r.size/1024/1024).toFixed(2)+'MB' : (r.size/1024).toFixed(1)+'KB'}</b></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
