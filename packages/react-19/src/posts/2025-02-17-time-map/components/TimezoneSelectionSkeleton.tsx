import { Skeleton } from '@mui/material';

export function TimezoneSelectionSkeleton() {
  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="w-2"></div>
      <div className="flex-1">
        <Skeleton variant="rounded" height={56}></Skeleton>
      </div>
      <div className="flex-1">
        <Skeleton variant="rounded" height={56}></Skeleton>
      </div>
    </div>
  );
}
