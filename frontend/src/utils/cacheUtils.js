/**
 * Cache Clearing Utility Functions
 * Implements Ctrl+F5 equivalent cache clearing for Google avatar issues
 */

/**
 * Clears browser cache equivalent to Ctrl+F5 hard refresh
 * Specifically targets Google avatar and cross-origin request cache
 */
export const clearAvatarCache = async () => {
  try {
    console.log('🧹 Starting cache clearing process...');

    // 1. Clear localStorage entries related to avatars/Google
    clearLocalStorageCache();
    
    // 2. Clear sessionStorage entries related to avatars/Google
    clearSessionStorageCache();
    
    // 3. Clear browser cache entries for Google domains
    await clearBrowserCache();
    
    // 4. Clear any stored request patterns
    clearRequestPatterns();
    
    console.log('✅ Cache clearing completed successfully');
  } catch (error) {
    console.warn('⚠️ Cache clearing encountered an error:', error);
    // Don't throw error - cache clearing is optional
  }
};

/**
 * Clear localStorage entries related to avatars and Google
 */
const clearLocalStorageCache = () => {
  try {
    const keys = Object.keys(localStorage);
    let clearedCount = 0;
    
    keys.forEach(key => {
      // Clear entries related to avatars, Google, or user sessions
      if (key.includes('avatar') || 
          key.includes('google') || 
          key.includes('oauth') ||
          key.includes('user') ||
          key.includes('profile')) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    });
    
    if (clearedCount > 0) {
      console.log(`🗑️ Cleared ${clearedCount} localStorage entries`);
    }
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

/**
 * Clear sessionStorage entries related to avatars and Google
 */
const clearSessionStorageCache = () => {
  try {
    const keys = Object.keys(sessionStorage);
    let clearedCount = 0;
    
    keys.forEach(key => {
      // Clear entries related to avatars, Google, or user sessions
      if (key.includes('avatar') || 
          key.includes('google') || 
          key.includes('oauth') ||
          key.includes('user') ||
          key.includes('profile')) {
        sessionStorage.removeItem(key);
        clearedCount++;
      }
    });
    
    if (clearedCount > 0) {
      console.log(`🗑️ Cleared ${clearedCount} sessionStorage entries`);
    }
  } catch (error) {
    console.warn('Failed to clear sessionStorage:', error);
  }
};

/**
 * Clear browser cache entries for Google domains and avatar URLs
 */
const clearBrowserCache = async () => {
  try {
    if (!('caches' in window)) {
      console.log('📝 Browser cache API not available');
      return;
    }

    const cacheNames = await caches.keys();
    let clearedCount = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const url = request.url;
        
        // Clear Google-related cache entries
        if (url.includes('googleusercontent.com') ||
            url.includes('googleapis.com') ||
            url.includes('google.com') ||
            url.includes('lh3.googleusercontent.com') ||
            url.includes('lh4.googleusercontent.com') ||
            url.includes('lh5.googleusercontent.com') ||
            url.includes('lh6.googleusercontent.com')) {
          
          await cache.delete(request);
          clearedCount++;
        }
      }
    }
    
    if (clearedCount > 0) {
      console.log(`🗑️ Cleared ${clearedCount} browser cache entries`);
    }
  } catch (error) {
    console.warn('Failed to clear browser cache:', error);
  }
};

/**
 * Clear any stored request patterns that might affect Google's CORS decisions
 */
const clearRequestPatterns = () => {
  try {
    // Clear any stored fetch request patterns
    if (window.fetch && window.fetch._originalFetch) {
      // Reset fetch if it was modified
      window.fetch = window.fetch._originalFetch;
    }
    
    // Clear any stored XMLHttpRequest patterns
    if (window.XMLHttpRequest && window.XMLHttpRequest._originalOpen) {
      // Reset XMLHttpRequest if it was modified
      window.XMLHttpRequest.prototype.open = window.XMLHttpRequest._originalOpen;
    }
    
    console.log('🔄 Cleared request patterns');
  } catch (error) {
    console.warn('Failed to clear request patterns:', error);
  }
};

/**
 * Force reload the page with cache clearing (equivalent to Ctrl+F5)
 * Use this as a last resort if other cache clearing methods don't work
 */
export const forceReloadWithCacheClear = () => {
  try {
    console.log('🔄 Force reloading page with cache clear...');
    
    // Clear cache first
    clearAvatarCache();
    
    // Force reload with cache bypass
    window.location.reload(true);
  } catch (error) {
    console.warn('Failed to force reload:', error);
    // Fallback to normal reload
    window.location.reload();
  }
};

/**
 * Check if cache clearing is needed based on user login method
 * @param {Object} user - User object
 * @returns {boolean} - True if cache clearing is recommended
 */
export const shouldClearCache = (user) => {
  if (!user) return false;
  
  // Clear cache for Google OAuth users to prevent CORS issues
  const isGoogleUser = user.provider === 'google' || user.google_id;
  
  return isGoogleUser;
};
