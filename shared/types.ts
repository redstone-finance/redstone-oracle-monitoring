export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: {
    dataFeedId?: string;
    evmSignerAddress?: string;
  };
}
