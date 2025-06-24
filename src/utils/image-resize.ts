import { MarketImageRule } from "@/types/market-image-rule";

export async function resizeImage(
  fileOrUrl: File | string,
  rule: MarketImageRule,
  ext: "jpg" | "png" = "jpg"
): Promise<Blob> {
  // 이미지 로드
  const img = await loadImage(fileOrUrl);
  // canvas 생성 및 리사이즈
  const canvas = document.createElement("canvas");
  canvas.width = rule.width;
  canvas.height = rule.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, rule.width, rule.height);

  // 확장자 및 품질 설정
  let quality = 0.92;
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  let blob: Blob | null = null;

  // 최대 용량 체크 및 품질 조정 (JPG만)
  do {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, ext === "jpg" ? quality : undefined)
    );
    if (ext === "png" || !blob) break;
    if (blob.size / 1024 / 1024 <= rule.maxSizeMB) break;
    quality -= 0.07;
  } while (quality > 0.5);

  if (!blob) throw new Error("이미지 변환 실패");
  if (blob.size / 1024 / 1024 > rule.maxSizeMB) {
    throw new Error("최대 용량을 맞출 수 없습니다.");
  }
  return blob;
}

async function loadImage(fileOrUrl: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      window.electronLogger?.log("이미지 로드 성공", fileOrUrl);
      resolve(img);
    };
    img.onerror = (e) => {
      window.electronLogger?.log("이미지 로드 실패", fileOrUrl, e);
      reject(new Error("이미지 로드 실패: " + fileOrUrl));
    };
    if (typeof fileOrUrl === "string") {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (e) => {
        window.electronLogger?.log("FileReader 에러", e);
        reject(e);
      };
      reader.readAsDataURL(fileOrUrl);
    }
  });
} 