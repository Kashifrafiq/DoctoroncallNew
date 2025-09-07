import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "diseases_cache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const PAGE_SIZE = 50; // Reduced page size for faster initial load
const MAX_RETRIES = 3;
const CHUNK_SIZE = 50; // Reduced chunk size for better Android compatibility
const CACHE_PREFIX = "diseases_chunk_";
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB limit for Android compatibility

// Check if data size is within limits
const isDataSizeAcceptable = (data) => {
  try {
    const dataString = JSON.stringify(data);
    const sizeInBytes = new Blob([dataString]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    console.log(`Data size: ${sizeInMB.toFixed(2)}MB`);
    return sizeInMB <= 5; // 5MB limit
  } catch (error) {
    console.error("Error calculating data size:", error);
    return false;
  }
};

// Compress data before storing
const compressData = (data) => {
  try {
    // Simple compression by removing unnecessary whitespace
    return JSON.stringify(data, null, 0);
  } catch (error) {
    console.error("Error compressing data:", error);
    return JSON.stringify(data);
  }
};

const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      // Wait for 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
};

const getCachedData = async () => {
  try {
    // Get metadata first
    const metadata = await AsyncStorage.getItem(`${CACHE_PREFIX}metadata`);
    if (!metadata) return null;

    const { totalChunks, timestamp } = JSON.parse(metadata);

    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      console.log("Cache expired, clearing...");
      await clearCache();
      return null;
    }

    const chunkKeys = Array.from(
      { length: totalChunks },
      (_, i) => `${CACHE_PREFIX}${i}`
    );

    // Fetch all chunks in parallel
    const chunks = await AsyncStorage.multiGet(chunkKeys);
    const allData = chunks.flatMap(([_, value]) =>
      value ? JSON.parse(value).data : []
    );

    return allData;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
};

const saveToCache = async (data) => {
  try {
    // Check if data size is acceptable
    if (!isDataSizeAcceptable(data)) {
      console.warn("Data too large for caching, skipping cache save");
      return false;
    }

    // Clear existing cache first
    await clearCache();

    // Split data into smaller chunks for better Android compatibility
    const chunks = [];
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      chunks.push(data.slice(i, i + CHUNK_SIZE));
    }

    // Store each chunk separately with compression
    await Promise.all(
      chunks.map((chunk, index) =>
        AsyncStorage.setItem(
          `${CACHE_PREFIX}${index}`,
          compressData({
            data: chunk,
            timestamp: Date.now(),
          })
        )
      )
    );

    // Store metadata (number of chunks)
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}metadata`,
      JSON.stringify({
        totalChunks: chunks.length,
        timestamp: Date.now(),
        dataSize: data.length,
      })
    );

    console.log(
      `Successfully cached ${data.length} items in ${chunks.length} chunks`
    );
    return true;
  } catch (error) {
    console.error("Error saving to cache:", error);
    return false;
  }
};

// Clear cache function
const clearCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log("Cache cleared successfully");
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

export const getDiseasesCatogery = async (page = 1, allData = []) => {
  try {
    const response = await fetch(
      `https://doctoroncallstp.com/wp-json/wp/v2/disease-category/?per_page=100&page=${page}`
    );

    if (!response.ok) {
      if (response.status === 400) {
        // No more pages, return accumulated data
        return allData;
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

    // Accumulate data
    const newData = [...allData, ...data];

    // If there are more pages, fetch them recursively
    if (page < totalPages) {
      return getDiseasesCatogery(page + 1, newData);
    }

    return newData;
  } catch (error) {
    console.error("Error fetching disease categories:", error);
    return allData; // Return what we have so far
  }
};

export const getdiseases = async (page = 1, allData = []) => {
  try {
    // Check cache first
    const cachedData = await getCachedData();
    if (cachedData && cachedData.length > 0) {
      console.log(`Using cached data: ${cachedData.length} items`);
      return cachedData;
    }

    console.log("Fetching fresh data from API...");

    // Get total pages first
    const initialResponse = await fetchWithRetry(
      `https://doctoroncallstp.com/wp-json/wp/v2/disease/?per_page=${PAGE_SIZE}&page=1`
    );
    const totalPages =
      parseInt(initialResponse.headers.get("X-WP-TotalPages")) || 1;

    console.log(`Total pages to fetch: ${totalPages}`);

    // Create array of page numbers to fetch
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Fetch all pages in parallel
    const pagePromises = pageNumbers.map((pageNum) =>
      fetchWithRetry(
        `https://doctoroncallstp.com/wp-json/wp/v2/disease/?per_page=${PAGE_SIZE}&page=${pageNum}`
      ).then((response) => response.json())
    );

    // Wait for all requests to complete
    const results = await Promise.all(pagePromises);

    // Flatten and combine all results
    const combinedData = results.flat();

    console.log(`Fetched ${combinedData.length} items from API`);

    // Try to save to cache (will skip if too large)
    const cacheSaved = await saveToCache(combinedData);
    if (!cacheSaved) {
      console.log("Data not cached due to size constraints");
    }

    return combinedData;
  } catch (error) {
    console.error("Error fetching diseases:", error);
    // If there's an error, try to return cached data even if expired
    const cachedData = await getCachedData();
    if (cachedData) {
      console.log("Using expired cached data as fallback");
      return cachedData;
    }
    return allData; // Return what we have so far
  }
};

// Export cache management functions
export const clearDiseasesCache = clearCache;
export const getCacheInfo = async () => {
  try {
    const metadata = await AsyncStorage.getItem(`${CACHE_PREFIX}metadata`);
    if (!metadata) return null;

    const { totalChunks, timestamp, dataSize } = JSON.parse(metadata);
    return {
      totalChunks,
      timestamp,
      dataSize,
      isExpired: Date.now() - timestamp > CACHE_EXPIRY,
    };
  } catch (error) {
    console.error("Error getting cache info:", error);
    return null;
  }
};
