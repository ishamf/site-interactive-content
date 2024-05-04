import type { URLElement } from './types';

export function parseUrlToElement(urlString: string): URLElement {
  let url: URL;
  try {
    url = lenientParseUrl(urlString);
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
    value: lenientStringifyUrl(url),
    params: params.length ? params : undefined,
  };

  return result;
}

const invalidUrlScheme = `invalidurl${Math.random().toString(32).slice(2)}:`;
const invalidUrlSchemeWithSlash = invalidUrlScheme + '//';

export function lenientParseUrl(urlString: string): URL {
  try {
    return new URL(urlString);
  } catch (e) {
    return new URL(invalidUrlSchemeWithSlash + urlString);
  }
}

export function lenientStringifyUrl(url: URL): string {
  if (url.protocol === invalidUrlScheme) {
    return url.toString().slice(invalidUrlSchemeWithSlash.length);
  }

  return url.toString();
}
