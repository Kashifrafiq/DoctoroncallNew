import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCacheInfo, clearDiseasesCache } from "../Hooks/api/diseases";
import { getDrugsCacheInfo, clearDrugsCache } from "../Hooks/api/drugs";

// Cache management utility for Android compatibility
export class CacheManager {
  static async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        (key) => key.includes("_chunk_") || key.includes("_cache")
      );

      let totalSize = 0;
      const cacheInfo = {};

      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          totalSize += size;

          // Categorize by cache type
          if (key.includes("diseases_chunk_")) {
            cacheInfo.diseases = (cacheInfo.diseases || 0) + size;
          } else if (key.includes("drugs_chunk_")) {
            cacheInfo.drugs = (cacheInfo.drugs || 0) + size;
          }
        }
      }

      return {
        totalSize: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        diseasesSizeMB: ((cacheInfo.diseases || 0) / (1024 * 1024)).toFixed(2),
        drugsSizeMB: ((cacheInfo.drugs || 0) / (1024 * 1024)).toFixed(2),
        cacheKeys: cacheKeys.length,
        isNearLimit: totalSize > 4 * 1024 * 1024, // 4MB warning
        isOverLimit: totalSize > 5 * 1024 * 1024, // 5MB limit
      };
    } catch (error) {
      console.error("Error getting storage info:", error);
      return null;
    }
  }

  static async clearAllCache() {
    try {
      await clearDiseasesCache();
      await clearDrugsCache();
      console.log("All cache cleared successfully");
      return true;
    } catch (error) {
      console.error("Error clearing all cache:", error);
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
      console.error("Error getting detailed cache info:", error);
      return null;
    }
  }

  static async shouldClearCache() {
    const storageInfo = await this.getStorageInfo();
    return storageInfo && storageInfo.isOverLimit;
  }

  static async optimizeCache() {
    try {
      const storageInfo = await this.getStorageInfo();

      if (storageInfo && storageInfo.isNearLimit) {
        console.log("Cache size is near limit, clearing old cache...");
        await this.clearAllCache();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error optimizing cache:", error);
      return false;
    }
  }
}

// Android-specific storage optimization
export const optimizeForAndroid = async () => {
  try {
    const storageInfo = await CacheManager.getStorageInfo();

    if (!storageInfo) {
      console.log("Could not get storage info");
      return false;
    }

    console.log(`Current cache size: ${storageInfo.totalSizeMB}MB`);

    if (storageInfo.isOverLimit) {
      console.log("Cache exceeds Android limit, clearing...");
      await CacheManager.clearAllCache();
      return true;
    }

    if (storageInfo.isNearLimit) {
      console.log("Cache is near Android limit, consider clearing soon");
    }

    return false;
  } catch (error) {
    console.error("Error optimizing for Android:", error);
    return false;
  }
};

// Monitor cache usage
export const monitorCacheUsage = () => {
  return setInterval(async () => {
    const storageInfo = await CacheManager.getStorageInfo();
    if (storageInfo) {
      console.log(`Cache usage: ${storageInfo.totalSizeMB}MB`);

      if (storageInfo.isOverLimit) {
        console.warn("Cache limit exceeded, clearing...");
        await CacheManager.clearAllCache();
      }
    }
  }, 30000); // Check every 30 seconds
};
