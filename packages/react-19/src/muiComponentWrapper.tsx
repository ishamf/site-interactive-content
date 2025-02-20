import r2wc from '@r2wc/react-to-web-component';

import { addAppStylesheet } from './utils';
import { CacheProvider } from '@emotion/react';
import createCache, { EmotionCache } from '@emotion/cache';
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles';
import { useRef } from 'react';

import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers';

let createdCaches = 0;

const numToCharMap: Record<string, string> = {
  '0': 'a',
  '1': 'b',
  '2': 'c',
  '3': 'd',
  '4': 'e',
  '5': 'f',
  '6': 'g',
  '7': 'h',
  '8': 'i',
  '9': 'j',
};

function toAlphabet(num: number) {
  const res = [];

  for (const c of num.toString()) {
    res.push(numToCharMap[c] ?? 'x');
  }

  return res.join('');
}

export function toMuiWebComponent(Component: any) {
  const MuiWrapperComponent = ({ container, ...rest }: { container: any }) => {
    const cacheRef = useRef<EmotionCache>(null);
    const themeRef = useRef<Theme>(null);

    if (!cacheRef.current) {
      const cacheKey = `emotion-mui-${toAlphabet(createdCaches++)}`;

      cacheRef.current = createCache({ key: cacheKey, prepend: true, container });
    }

    if (!themeRef.current) {
      themeRef.current = createTheme({
        colorSchemes: {
          dark: true,
        },
        components: {
          MuiPopper: {
            defaultProps: {
              container,
            },
          },
        },
      });
    }

    return (
      <CacheProvider value={cacheRef.current}>
        <ThemeProvider theme={themeRef.current}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <Component {...rest}></Component>
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    );
  };

  return addAppStylesheet(r2wc(MuiWrapperComponent, { shadow: 'open' }));
}
