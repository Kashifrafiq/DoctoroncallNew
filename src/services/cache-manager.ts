import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearDiseasesCache, getCacheInfo } from '@/hooks/api/diseases';
import { clearDrugsCache, getDrugsCacheInfo } from '@/hooks/api/drugs';

type StorageInfo = {
  totalSize: number;
  totalSizeMB: string;
  diseasesSizeMB: string;
  drugsSizeMB: string;
  cacheKeys: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
};

function getStringByteSize(value: string): number {
  return new TextEncoder().encode(value).length;
}

export class CacheManager {
  static async getStorageInfo(): Promise<StorageInfo | null> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.includes('_chunk_') || key.includes('_cache'));

      let totalSize = 0;
      const cacheInfo: { diseases?: number; drugs?: number } = {};

      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const size = getStringByteSize(value);
          totalSize += size;

          if (key.includes('diseases_chunk_')) {
            cacheInfo.diseases = (cacheInfo.diseases || 0) + size;
          } else if (key.includes('drugs_chunk_')) {
            cacheInfo.drugs = (cacheInfo.drugs || 0) + size;
          }
        }
      }

      return {
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        diseasesSizeMB: ((cacheInfo.diseases || 0) / (1024 * 1024)).toFixed(2),
        drugsSizeMB: ((cacheInfo.drugs || 0) / (1024 * 1024)).toFixed(2),
        cacheKeys: cacheKeys.length,
        isNearLimit: totalSize > 4 * 1024 * 1024,
        isOverLimit: totalSize > 5 * 1024 * 1024,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  static async clearAllCache(): Promise<boolean> {
    try {
      await clearDiseasesCache();
      await clearDrugsCache();
      console.log('All cache cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return false;
    }
  }

  static async getDetailedCacheInfo() {
    try {
      const [diseasesInfo, drugsInfo, storageInfo] = await Promise.all([
        getCacheInfo(),
        getDrugsCacheInfo(),
        this.getStorageInfo(),
      ]);

      return {
        diseases: diseasesInfo,
        drugs: drugsInfo,
        storage: storageInfo,
      };
    } catch (error) {
      console.error('Error getting detailed cache info:', error);
      return null;
    }
  }

  static async shouldClearCache(): Promise<boolean> {
    const storageInfo = await this.getStorageInfo();
    return Boolean(storageInfo?.isOverLimit);
  }

  static async optimizeCache(): Promise<boolean> {
    try {
      const storageInfo = await this.getStorageInfo();

      if (storageInfo?.isNearLimit) {
        console.log('Cache size is near limit, clearing old cache...');
        await this.clearAllCache();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error optimizing cache:', error);
      return false;
    }
  }
}

export async function optimizeForAndroid(): Promise<boolean> {
  try {
    const storageInfo = await CacheManager.getStorageInfo();

    if (!storageInfo) {
      console.log('Could not get storage info');
      return false;
    }

    console.log(`Current cache size: ${storageInfo.totalSizeMB}MB`);

    if (storageInfo.isOverLimit) {
      console.log('Cache exceeds Android limit, clearing...');
      await CacheManager.clearAllCache();
      return true;
    }

    if (storageInfo.isNearLimit) {
      console.log('Cache is near Android limit, consider clearing soon');
    }

    return false;
  } catch (error) {
    console.error('Error optimizing for Android:', error);
    return false;
  }
}

export function monitorCacheUsage(): ReturnType<typeof setInterval> {
  return setInterval(async () => {
    const storageInfo = await CacheManager.getStorageInfo();
    if (storageInfo) {
      console.log(`Cache usage: ${storageInfo.totalSizeMB}MB`);

      if (storageInfo.isOverLimit) {
        console.warn('Cache limit exceeded, clearing...');
        await CacheManager.clearAllCache();
      }
    }
  }, 30000);
}
