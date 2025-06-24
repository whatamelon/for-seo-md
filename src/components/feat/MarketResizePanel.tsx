/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { MARKET_IMAGE_RULES, Market } from "@/types/market-image-rule";
import { resizeImage } from "@/utils/image-resize";
import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import ResizeResultList from "./ResizeResultList";
import { toast } from "sonner";

interface MarketResizePanelProps {
  imageSrc: string | null;
  imageFile: File | null;
  onResizeSuccess?: (results: { market: Market; blob: Blob }[]) => void;
}

// Electron 임시 파일 삭제 함수 타입 선언 (preload.ts, main.ts에도 추가 필요)
declare global {
  interface ElectronAPI {
    deleteTempFile?: (filePath: string) => Promise<void>;
    electronLogger?: {
      log: (message: string) => void;
    };
    readFileAsDataUrl?: (filePath: string) => Promise<string>;
  }
}

export default function MarketResizePanel({ imageSrc, imageFile, onResizeSuccess }: MarketResizePanelProps) {
  const [selectedMarkets, setSelectedMarkets] = useState<Market[]>([]);
  const [folderPath, setFolderPath] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resizeResults, setResizeResults] = useState<any[]>([]);

  // 저장된 값 불러오기 (최초 1회)
  useEffect(() => {
    if (window.electronStore) {
      const savedMarkets = window.electronStore.get("selectedMarkets");
      if (Array.isArray(savedMarkets)) setSelectedMarkets(savedMarkets as Market[]);
      const savedFolder = window.electronStore.get("folderPath");
      if (typeof savedFolder === "string") setFolderPath(savedFolder);
    }
  }, []);

  // 마켓 체크박스 핸들러
  const handleMarketChange = (market: Market) => {
    setSelectedMarkets((prev) => {
      const next = prev.includes(market)
        ? prev.filter((m) => m !== market)
        : [...prev, market];
      if (window.electronStore) window.electronStore.set("selectedMarkets", next);
      return next;
    });
  };

  // 폴더 선택
  const handleSelectFolder = async () => {
    if (window.electronAPI?.selectFolder) {
      const path = await window.electronAPI.selectFolder();
      if (path) {
        setFolderPath(path);
        if (window.electronStore) window.electronStore.set("folderPath", path);
      }
    } else {
      alert("Electron 환경에서만 동작합니다.");
    }
  };

  // 리사이즈 실행
  const handleResize = async () => {
    window.electronLogger?.log("리사이즈 시작", { imageFile, imageSrc, selectedMarkets, folderPath });
    if (!imageFile && !imageSrc) {
      toast.error("이미지를 먼저 업로드하세요.");
      return;
    }
    if (selectedMarkets.length === 0) {
      toast.error("마켓을 하나 이상 선택하세요.");
      return;
    }
    if (!folderPath) {
      toast.error("저장 폴더를 선택하세요.");
      return;
    }
    setLoading(true);
    let tempFileToDelete: string | null = null;

    try {
      let fileOrUrl: File | string = imageFile || imageSrc!;
      // 임시 파일 경로라면 DataURL로 변환 후 삭제 예약
      if (typeof imageSrc === "string" && imageSrc.startsWith("/")) {
        tempFileToDelete = imageSrc;
        if (window.electronAPI?.readFileAsDataUrl) {
          fileOrUrl = await window.electronAPI.readFileAsDataUrl(imageSrc);
        }
      }
      const blobs = [];
      const resultInfos = [];
      for (const market of selectedMarkets) {
        const rule = MARKET_IMAGE_RULES.find((r) => r.market === market)!;
        const blob = await resizeImage(fileOrUrl, rule, "jpg");
        blobs.push({ market, blob });
        // 파일 정보 수집
        const fileName = `${market}_${blob.size}.jpg`;
        const subFolder = dayjs().format("YYMMDD_HHmmss");
        const filePath = folderPath + "/" + subFolder + "/" + fileName;
        // 이미지 크기 추출
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const url = URL.createObjectURL(blob);
          const image = new window.Image();
          image.onload = () => {
            resolve(image);
            URL.revokeObjectURL(url);
          };
          image.onerror = reject;
          image.src = url;
        });
        resultInfos.push({
          market,
          filePath,
          fileName,
          width: img.width,
          height: img.height,
          size: blob.size,
        });
      }
      // 저장 폴더명 생성
      const subFolder = dayjs().format("YYMMDD_HHmmss");
      // 파일명 및 데이터 준비
      const files = await Promise.all(blobs.map(async ({ market, blob }) => ({
        name: `${market}_${blob.size}.jpg`,
        data: await blob.arrayBuffer(),
      })));
      // 저장 호출
      if (window.electronAPI?.saveImages) {
        await window.electronAPI.saveImages(folderPath, files, subFolder);
        setResizeResults(resultInfos);
        toast("저장 완료", { description: `${blobs.length}개 마켓용 이미지가 저장되었습니다.` });
      } else {
        toast.error("저장 실패", { description: "Electron 환경에서만 저장이 지원됩니다." });
      }   
      if (onResizeSuccess) onResizeSuccess(blobs);
      // 리사이즈 성공 후 임시 파일 삭제
      if (tempFileToDelete && window.electronAPI?.deleteTempFile) {
        await window.electronAPI?.deleteTempFile(tempFileToDelete);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("저장 실패", { description: e.message });
      // 실패해도 임시 파일 삭제 시도
      if (tempFileToDelete && window.electronAPI?.deleteTempFile) {
        await window.electronAPI.deleteTempFile(tempFileToDelete);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <h2 className="text-lg font-bold flex items-start justify-start w-full">2. Select</h2>
      <div>
        <div className="font-semibold text-sm mb-2">2-1. Select Market</div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <Checkbox
              checked={selectedMarkets.length === MARKET_IMAGE_RULES.length}
              onCheckedChange={() => {
                if (selectedMarkets.length === MARKET_IMAGE_RULES.length) {
                  setSelectedMarkets([])
                  if (window.electronStore) window.electronStore.set("selectedMarkets", [])
                } else {
                  const all = MARKET_IMAGE_RULES.map(r => r.market)
                  setSelectedMarkets(all)
                  if (window.electronStore) window.electronStore.set("selectedMarkets", all)
                }
              }}
              className="accent-primary"
              id="market-all"
            />
            <span className="text-sm font-semibold">All</span>
          </label>
          {MARKET_IMAGE_RULES.map((rule) => (
            <label key={rule.market} className="flex items-center gap-1 cursor-pointer select-none">
              <Checkbox
                checked={selectedMarkets.includes(rule.market)}
                onCheckedChange={() => handleMarketChange(rule.market)}
                className="accent-primary"
                id={`market-${rule.market}`}
              />
              <span className="text-sm font-semibold">{rule.market}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <div className="font-semibold text-sm mb-2">2-2. Select Save Folder</div>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground shadow hover:bg-secondary/80 flex-shrink-0 font-semibold text-xs"
            onClick={handleSelectFolder}
          >
            Select Folder
          </button>
          <span className="text-xs text-gray-500 break-all max-w-full flex-grow leading-snug line-clamp-2">{folderPath || "(선택 안 됨)"}</span>
        </div>
      </div>
      <button
        type="button"
        className="mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 disabled:opacity-50"
        onClick={handleResize}
        disabled={loading}
      >
        {loading ? "Resizing..." : "Resize"}
      </button>
      {resizeResults.length > 0 && <ResizeResultList results={resizeResults} />}
    </div>
  );
} 