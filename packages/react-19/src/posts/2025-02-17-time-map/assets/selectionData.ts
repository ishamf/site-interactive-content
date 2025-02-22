import citiesData from './data/cities.json';
import timezoneData from './data/timezones.json';

interface BaseSelectionData {
  label: string;
  timezone: string;
  id: string;
}

interface CitySelectionData extends BaseSelectionData {
  type: 'city';
  longitude: number;
  latitude: number;
  country: string;
}

interface CountryCapitalSelectionData extends BaseSelectionData {
  type: 'countryCapital';
  longitude: number;
  latitude: number;
  country: string;
}

interface TimezoneSelectionData extends BaseSelectionData {
  type: 'timezone';
  representativeCity: CitySelectionData | null;
}

export type SelectionData = CitySelectionData | CountryCapitalSelectionData | TimezoneSelectionData;

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
  }));

const citiesSelectionDataById = citiesSelectionData.reduce(
  (acc, city) => {
    acc[city.id] = city;
    return acc;
  },
  {} as Record<string, CitySelectionData>
);

const countryCapitalSelectionData: CountryCapitalSelectionData[] = citiesData
  .filter((city) => city.is_capital)
  .filter((city) => supportedTimezones.has(city.timezone))
  .map((city) => ({
    type: 'countryCapital',
    id: `capital-${city.country_name.toString()}`,
    label: city.country_name,
    timezone: city.timezone,
    longitude: city.longitude,
    latitude: city.latitude,
    country: city.country_name,
  }));

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

export const selectionData = [
  ...citiesSelectionData,
  ...countryCapitalSelectionData,
  ...timezoneSelectionData,
];
