import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { getSunAndEarthStateAtTime } from '../../2025-02-17-time-map/math';
import { CameraControls } from '@react-three/drei';
import { SelectionData } from '../../2025-02-17-time-map/assets';
import { useTimeMapStore } from '../../2025-02-17-time-map/store';

export function InitialCamera({
  selectionDataById,
}: {
  selectionDataById?: Record<string, SelectionData | undefined>;
}) {
  const controls = useThree((state) => state.controls) as CameraControls | null;
  const selectedItems = useTimeMapStore((state) => state.selectedItems);
  const hasSetInitialCamera = useRef(false);

  useEffect(() => {
    if (!controls || !selectionDataById || hasSetInitialCamera.current) {
      return;
    }

    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const currentItem = selectedItems.find((item) => {
      if (!item.itemId) {
        return false;
      }

      const selection = selectionDataById[item.itemId];

      return (
        selection &&
        ((selection?.type === 'city' && selection.timezone === currentTimezone) ||
          (selection?.type === 'timezone' &&
            selection.timezone === currentTimezone &&
            selection.representativeCity))
      );
    });

    let longitude = 0;
    let latitude = 0;

    if (currentItem && currentItem.itemId) {
      const currentSelection = selectionDataById[currentItem.itemId]!;

      const city =
        currentSelection.type === 'city' ? currentSelection : currentSelection.representativeCity!;

      longitude = city.longitude;
      latitude = city.latitude;
    } else {
      const currentTime = Date.now();

      const sunAndEarthState = getSunAndEarthStateAtTime(currentTime);

      longitude = sunAndEarthState.rightAscension - sunAndEarthState.gmstHours * 15;
      latitude = sunAndEarthState.declination;
    }

    const azimuthDeg = longitude + 90;
    const polarDeg = 90 - latitude;

    controls.rotateTo((azimuthDeg * Math.PI) / 180, (polarDeg * Math.PI) / 180, false);

    hasSetInitialCamera.current = true;
  }, [controls, selectedItems, selectionDataById]);

  return null;
}
