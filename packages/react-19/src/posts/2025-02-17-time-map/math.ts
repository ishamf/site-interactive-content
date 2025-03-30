import { flMod } from '../../utils/math';
import { SunAndEarthState } from './types';

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/**
 * Converts a circular value to a range that includes negative values.
 *
 * Example:
 * - Input: value = 270, size = 360
 * - Output: -90 (since 270 is equivalent to -90 in a circular range)
 *
 * @param value - The circular value to convert.
 * @param size - The size of the circular range (e.g., 360 for degrees).
 * @returns The converted value, allowing for negative values.
 */
function convertCircularValueToAllowNegative(value: number, size: number) {
  return value <= size / 2 ? value : value - size;
}

function linearlyInterpolateCircularValues(from: number, to: number, size: number, amount: number) {
  const d1 = flMod(to - from, size);
  const d2 = d1 - size;
  const diff = -d2 < d1 ? d2 : d1;

  return flMod(from + diff * amount, size);
}

export function linearlyInterpolateSunAndEarthState(
  from: SunAndEarthState,
  to: SunAndEarthState,
  amount: number
): SunAndEarthState {
  return {
    gmstHours: linearlyInterpolateCircularValues(from.gmstHours, to.gmstHours, 24, amount),
    rightAscension: convertCircularValueToAllowNegative(
      linearlyInterpolateCircularValues(from.rightAscension, to.rightAscension, 360, amount),
      360
    ),
    declination: convertCircularValueToAllowNegative(
      linearlyInterpolateCircularValues(from.declination, to.declination, 360, amount),
      360
    ),
  };
}

export function getSunAndEarthStateAtTime(time: number): SunAndEarthState {
  // https://aa.usno.navy.mil/faq/sun_approx
  const julianDate = time / 86400000 + 2440587.5;
  const daysSinceEpoch = julianDate - 2451545.0;
  const meanAnomaly = flMod(357.529 + 0.98560028 * daysSinceEpoch, 360);
  const meanLongitude = flMod(280.459 + 0.98564736 * daysSinceEpoch, 360);
  const eclipticLongitude = flMod(
    meanLongitude + 1.915 * Math.sin(toRad(meanAnomaly)) + 0.02 * Math.sin(2 * toRad(meanAnomaly)),
    360
  );
  const meanObliquityOfTheElliptic = 23.439 - 0.00000036 * daysSinceEpoch;
  const rightAscension = toDeg(
    Math.atan2(
      Math.cos(toRad(meanObliquityOfTheElliptic)) * Math.sin(toRad(eclipticLongitude)),
      Math.cos(toRad(eclipticLongitude))
    )
  );
  const declination = toDeg(
    Math.asin(Math.sin(toRad(meanObliquityOfTheElliptic)) * Math.sin(toRad(eclipticLongitude)))
  );

  // https://aa.usno.navy.mil/faq/GAST
  // We just use one time scale
  // > The difference between TT and UT1 is small, ∼0.001 day, so for most applications JDTT = JDUT
  // (quote from above page)
  const centuriesSinceEpoch = daysSinceEpoch / 36525;
  const hourComponentOfJulianDate = flMod(julianDate + 0.5, 1) * 24;
  const gmstHours = flMod(
    6.697375 +
      0.065709824279 * daysSinceEpoch +
      1.0027379 * hourComponentOfJulianDate +
      0.0000258 * centuriesSinceEpoch ** 2,
    24
  );

  // We just use GMST to keep it simple
  // > The maximum value of the equation of the equinoxes is about 1.1 seconds,
  // > so if an error of ~1 second is unimportant, the transformation from GMST to GAST can be skipped.

  return { rightAscension, declination, gmstHours };
}

export function createAlphaCalculator({
  rightAscension,
  declination,
  gmstHours,
  precalculate: { width, height },
}: SunAndEarthState & {
  precalculate: { width: number; height: number };
}) {
  // Calculate sun altitude
  // https://aa.usno.navy.mil/faq/alt_az

  // Precalculate the longitude and latitude-based components so we only need to calculate these
  // once per row/column. From testing, it seems to be 50% faster
  const localHourAngleByX: number[] = [];

  // Altitude = lha * a + b
  const altitudeAByY: number[] = [];
  const altitudeBByY: number[] = [];

  for (let x = 0; x < width; x++) {
    const longitude = ((x + 0.5) / width) * 360 - 180;

    const localHourAngle = toRad(
      flMod(gmstHours * 15 - rightAscension + flMod(longitude, 360), 360)
    );

    localHourAngleByX.push(localHourAngle);
  }

  for (let y = 0; y < height; y++) {
    const latitude = -(((y + 0.5) / height) * 180 - 90);
    altitudeAByY.push(Math.cos(toRad(declination)) * Math.cos(toRad(latitude)));
    altitudeBByY.push(Math.sin(toRad(declination)) * Math.sin(toRad(latitude)));
  }

  function getAlphaFromAltitude(altitude: number) {
    const shadeUpperAngle = 8;
    const shadeLowerAngle = -2;

    return altitude > shadeUpperAngle
      ? 1
      : altitude < shadeLowerAngle
        ? 0
        : (altitude - shadeLowerAngle) / (shadeUpperAngle - shadeLowerAngle);
  }

  function getAlphaWithPrecalculatedComponents(x: number, y: number) {
    const localHourAngle = localHourAngleByX[x];

    const altitude = toDeg(Math.asin(Math.cos(localHourAngle) * altitudeAByY[y] + altitudeBByY[y]));

    return getAlphaFromAltitude(altitude);
  }

  /**
   * Function to get the alpha value directly (without precalculation)
   */
  function getAlphaWithLatLong(latitude: number, longitude: number) {
    // https://aa.usno.navy.mil/faq/alt_az
    const localHourAngle = flMod(gmstHours * 15 - rightAscension + flMod(longitude, 360), 360);

    const altitude = toDeg(
      Math.asin(
        Math.cos(toRad(localHourAngle)) * Math.cos(toRad(declination)) * Math.cos(toRad(latitude)) +
          Math.sin(toRad(declination)) * Math.sin(toRad(latitude))
      )
    );

    return getAlphaFromAltitude(altitude);
  }

  return { getAlphaWithLatLong, getAlphaWithPrecalculatedComponents };
}
