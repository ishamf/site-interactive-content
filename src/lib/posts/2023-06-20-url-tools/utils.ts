import type { URLElement } from './types';

export function parseUrlToElement(urlString: string): URLElement {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch (e) {
    return { value: urlString };
  }

  const params: NonNullable<URLElement['params']> = Array.from(url.searchParams.entries()).map(
    ([key, value]) => ({
      key,
      url: parseUrlToElement(value),
    })
  );

  url.search = '';

  const result: URLElement = {
    value: url.toString(),
    params: params.length ? params : undefined,
  };

  return result;
}
