import r2wc from '@r2wc/react-to-web-component';

import { addAppStylesheet } from './utils';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';

import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let createdCaches = 0;

const queryClient = new QueryClient();

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

export function toMuiWebComponent(Component: any): any {
  const MuiWrapperComponent = ({ container, ...rest }: { container: any }) => {
    const emotionCache = useMemo(() => {
      const cacheKey = `emotion-mui-${toAlphabet(createdCaches++)}`;

      return createCache({ key: cacheKey, prepend: true, container });
    }, [container]);

    const muiTheme = useMemo(() => {
      return createTheme({
        colorSchemes: {
          dark: true,
        },
        components: {
          MuiPopover: {
            defaultProps: {
              container,
            },
          },
          MuiPopper: {
            defaultProps: {
              container,
            },
          },
          MuiModal: {
            defaultProps: {
              container,
            },
          },
        },
      });
    }, [container]);

    return (
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={muiTheme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <QueryClientProvider client={queryClient}>
              <Component {...rest}></Component>
            </QueryClientProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    );
  };

  return addAppStylesheet(r2wc(MuiWrapperComponent, { shadow: 'open' }));
}
