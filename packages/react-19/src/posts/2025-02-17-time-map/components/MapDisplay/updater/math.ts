/**
 * mod function that always return a result with the sign of the divisor
 */
function flMod(numer: number, divisor: number) {
  let r = numer % divisor;
  if ((r > 0 && divisor < 0) || (r < 0 && divisor > 0)) {
    r = r + divisor;
  }
  return r;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function createAlphaCalculator({
  width,
  height,
  time,
}: {
  time: number;
  width: number;
  height: number;
}) {
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

  // Precalculate the longitude and latitude-based components so we only need to calculate these
  // once per row/column. From testing, it seems to be 50% faster
  const localHourAngleByX: number[] = [];

  // Altitude = lha * a + b
  const altitudeAByY: number[] = [];
  const altitudeBByY: number[] = [];

  for (let x = 0; x < width; x++) {
    const longitude = ((x + 0.5) / width) * 360 - 180;

    const localHourAngle = flMod(gmstHours * 15 - rightAscension + flMod(longitude, 360), 360);

    localHourAngleByX.push(localHourAngle);
  }

  for (let y = 0; y < height; y++) {
    const latitude = -(((y + 0.5) / height) * 180 - 90);
    altitudeAByY.push(Math.cos(toRad(declination)) * Math.cos(toRad(latitude)));
    altitudeBByY.push(Math.sin(toRad(declination)) * Math.sin(toRad(latitude)));
  }

  function getAlpha(x: number, y: number) {
    // https://aa.usno.navy.mil/faq/alt_az
    const localHourAngle = localHourAngleByX[x];

    const altitude = toDeg(
      Math.asin(Math.cos(toRad(localHourAngle)) * altitudeAByY[y] + altitudeBByY[y])
    );

    const shadeAngle = 5;

    return altitude > shadeAngle
      ? 1
      : altitude < -shadeAngle
        ? 0
        : (altitude + shadeAngle) / (2 * shadeAngle);
  }

  return getAlpha;
}
