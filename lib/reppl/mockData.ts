import type { RepplAnalysisMock, RepplCompetitorMock } from "./types";

export const MOCK_ANALYSIS: RepplAnalysisMock = {
  primaryIssue: "Competitor bundle undercut on hero SKU",
  why: [
    "Price point shifted 12% in 48h",
    "Search placement favors alternate sellers",
    "Inventory language signals short-run promo",
  ],
  direction: [
    "Defend margin on core PDP",
    "Test counter-bundle with add-on",
    "Shift ad spend to high-intent queries",
  ],
  optionsConsidered: [
    { text: "Match price across catalog", selected: false },
    { text: "Hold price; add value bundle", selected: true },
  ],
  discoverability: "MEDIUM",
  aiReason: [
    "Model surfaces fewer direct alternatives than last run",
    "New entrants still indexing on generic terms",
  ],
};

export const MOCK_COMPETITORS: RepplCompetitorMock[] = [
  {
    id: "c1",
    name: "NORTHBOUND LABS",
    url: "northbound.example",
    price: "$42",
    offers: "BUNDLE + FREE SHIP",
    lastScanHours: 4,
  },
  {
    id: "c2",
    name: "URBAN RITUAL",
    url: "urbanritual.example",
    price: "$38",
    offers: "SUBSCRIBE 10% OFF",
    lastScanHours: 9,
  },
];
