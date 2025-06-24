export type Market =
  | "카페24"
  | "29cm"
  | "w컨셉"
  | "옥션"
  | "11번가"
  | "G마켓"
  | "쿠팡"
  | "SSG";

export interface MarketImageRule {
  market: Market;
  width: number;
  height: number;
  maxSizeMB: number;
  extensions: ("jpg" | "png")[];
}

export const MARKET_IMAGE_RULES: MarketImageRule[] = [
  { market: "카페24", width: 1400, height: 1400, maxSizeMB: 3, extensions: ["jpg", "png"] },
  { market: "29cm", width: 1000, height: 1000, maxSizeMB: 2, extensions: ["jpg", "png"] },
  { market: "w컨셉", width: 850, height: 1000, maxSizeMB: 2, extensions: ["jpg", "png"] },
  { market: "옥션", width: 1000, height: 1000, maxSizeMB: 2, extensions: ["jpg", "png"] },
  { market: "11번가", width: 1000, height: 1000, maxSizeMB: 3, extensions: ["jpg", "png"] },
  { market: "G마켓", width: 1000, height: 1000, maxSizeMB: 2, extensions: ["jpg", "png"] },
  { market: "쿠팡", width: 500, height: 500, maxSizeMB: 1, extensions: ["jpg", "png"] },
  { market: "SSG", width: 1200, height: 1200, maxSizeMB: 3, extensions: ["jpg", "png"] },
]; 