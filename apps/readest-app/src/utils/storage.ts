import { getObjectStorageType } from '@/utils/runtimeConfig';

type ObjectStorageType = 'r2' | 's3';

export const getStorageType = (): ObjectStorageType => {
  const storageType = getObjectStorageType();
  if (storageType) {
    return storageType as ObjectStorageType;
  }
  return 'r2';
};
