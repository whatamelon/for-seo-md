export type Market =
  | "카페24"
  | "29cm"
  | "w컨셉"
  | "옥션"
  | "11번가"
  | "G마켓"
  | "쿠팡"
  | "SSG";

export type Market_EN =
  | "cafe24"
  | "29cm"
  | "wconcept"
  | "auction"
  | "gmarket"
  | "11st"
  | "coupang"
  | "ssg";

export interface MarketImageRule {
  market: Market;
  market_en: Market_EN;
  width: number;
  height: number;
  maxSizeMB: number;
  extensions: ("jpg" | "png")[];
}

export const MARKET_IMAGE_RULES: MarketImageRule[] = [
  {
    market: "카페24",
    market_en: "cafe24",
    width: 1400,
    height: 1400,
    maxSizeMB: 3,
    extensions: ["jpg", "png"],
  },
  {
    market: "29cm",
    market_en: "29cm",
    width: 1000,
    height: 1000,
    maxSizeMB: 2,
    extensions: ["jpg", "png"],
  },
  {
    market: "w컨셉",
    market_en: "wconcept",
    width: 850,
    height: 1000,
    maxSizeMB: 2,
    extensions: ["jpg", "png"],
  },
  {
    market: "옥션",
    market_en: "auction",
    width: 1000,
    height: 1000,
    maxSizeMB: 2,
    extensions: ["jpg", "png"],
  },
  {
    market: "11번가",
    market_en: "11st",
    width: 1000,
    height: 1000,
    maxSizeMB: 3,
    extensions: ["jpg", "png"],
  },
  {
    market: "G마켓",
    market_en: "gmarket",
    width: 1000,
    height: 1000,
    maxSizeMB: 2,
    extensions: ["jpg", "png"],
  },
  {
    market: "쿠팡",
    market_en: "coupang",
    width: 500,
    height: 500,
    maxSizeMB: 1,
    extensions: ["jpg", "png"],
  },
  {
    market: "SSG",
    market_en: "ssg",
    width: 1200,
    height: 1200,
    maxSizeMB: 3,
    extensions: ["jpg", "png"],
  },
];
