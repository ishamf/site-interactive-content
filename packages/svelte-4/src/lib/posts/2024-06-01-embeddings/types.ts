export type Sentence = {
  value: string;
};

export type ProjectedSentence = Sentence & {
  x: number;
  y: number;
};
