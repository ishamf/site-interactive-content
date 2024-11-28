export type URLElement = {
  value: string;
  params?: { key: string; url: URLElement }[];
};
