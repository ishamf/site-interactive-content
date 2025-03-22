import citiesData from './data/cities.json';
import timezoneData from './data/timezones.json';

interface BaseSelectionData {
  label: string;
  timezone: string;
  id: string;
}

export interface CitySelectionData extends BaseSelectionData {
  type: 'city';
  longitude: number;
  latitude: number;
  country: string;
  population: number;
  isCapital: boolean;
}

interface TimezoneSelectionData extends BaseSelectionData {
  type: 'timezone';
  representativeCity: CitySelectionData | null;
}

export type SelectionData = CitySelectionData | TimezoneSelectionData;

const supportedTimezones = new Set(Intl.supportedValuesOf('timeZone'));

const citiesSelectionData: CitySelectionData[] = citiesData
  .filter((city) => supportedTimezones.has(city.timezone))
  .map((city) => ({
    type: 'city',
    id: city.id.toString(),
    label: city.name,
    timezone: city.timezone,
    longitude: city.longitude,
    latitude: city.latitude,
    country: city.country_name,
    population: city.population,
    isCapital: city.is_capital,
  }));

const citiesSelectionDataById = citiesSelectionData.reduce(
  (acc, city) => {
    acc[city.id] = city;
    return acc;
  },
  {} as Record<string, CitySelectionData>
);

const timezoneSelectionData: TimezoneSelectionData[] = timezoneData
  .filter((timezone) => supportedTimezones.has(timezone.TimeZoneId))
  .map((timezone) => {
    const representativeCity =
      timezone.city && citiesSelectionDataById[timezone.city.toString()]
        ? citiesSelectionDataById[timezone.city.toString()]
        : null;

    return {
      type: 'timezone',
      id: timezone.TimeZoneId.toString(),
      label: timezone.TimeZoneId,
      timezone: timezone.TimeZoneId,
      representativeCity,
    };
  });

export const selectionData = [...citiesSelectionData, ...timezoneSelectionData];

selectionData.sort((a, b) => {
  if (a.type === 'city' && b.type === 'timezone') {
    return -1;
  } else if (a.type === 'timezone' && b.type === 'city') {
    return 1;
  } else if (a.type === 'city' && b.type === 'city') {
    if (a.isCapital && !b.isCapital) {
      return -1;
    } else if (!a.isCapital && b.isCapital) {
      return 1;
    }

    return b.population - a.population;
  }

  if (a.label < b.label) {
    return -1;
  }
  if (a.label > b.label) {
    return 1;
  }
  return 0;
});

export const selectionDataById = selectionData.reduce(
  (acc, selection) => {
    acc[selection.id] = selection;
    return acc;
  },
  {} as Record<string, SelectionData>
);
