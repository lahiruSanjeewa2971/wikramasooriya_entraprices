import { pipeline } from '@xenova/transformers';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Model service for caching and managing SentenceTransformers model with persistent storage
 */
class ModelService {
  constructor() {
    this.model = null;
    this.isLoading = false;
    this.loadPromise = null;
    this.modelName = 'Xenova/all-MiniLM-L6-v2';
    this.cacheDir = path.join(__dirname, '..', '..', 'models');
    this.modelDir = path.join(this.cacheDir, 'all-MiniLM-L6-v2');
  }

  /**
   * Check if model files exist in persistent storage
   */
  isModelCached() {
    try {
      // @xenova/transformers creates: models/Xenova/all-MiniLM-L6-v2/
      const actualModelDir = path.join(this.cacheDir, 'Xenova', 'all-MiniLM-L6-v2');
      const requiredFiles = [
        'config.json',
        'tokenizer.json',
        path.join('onnx', 'model_quantized.onnx') // The actual model file
      ];
      
      return requiredFiles.every(file => {
        const filePath = path.join(actualModelDir, file);
        return fs.existsSync(filePath);
      });
    } catch (error) {
      logger.warn('Error checking model cache:', error.message);
      return false;
    }
  }

  /**
   * Ensure cache directory exists
   */
  ensureCacheDirectory() {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
        logger.info(`Created model cache directory: ${this.cacheDir}`);
      }
      if (!fs.existsSync(this.modelDir)) {
        fs.mkdirSync(this.modelDir, { recursive: true });
        logger.info(`Created model directory: ${this.modelDir}`);
      }
    } catch (error) {
      logger.error('Failed to create cache directories:', error.message);
    }
  }

  /**
   * Initialize and cache the model with persistent storage
   */
  async initializeModel() {
    if (this.model) {
      logger.info('Model already loaded, using cached instance');
      return this.model;
    }

    if (this.isLoading) {
      logger.info('Model is currently loading, waiting for completion...');
      return this.loadPromise;
    }

    this.isLoading = true;
    
    // Ensure cache directory exists
    this.ensureCacheDirectory();
    
    // Check if model is already cached
    const isCached = this.isModelCached();
    const startTime = Date.now();
    
    if (isCached) {
      logger.info('✅ Model files found in cache, loading from persistent storage...');
      logger.info('⏳ Loading cached model into memory (this may take 10-30 seconds)...');
    } else {
      logger.info('📥 Model not cached, downloading SentenceTransformers model: all-MiniLM-L6-v2...');
      logger.info('⏳ This may take 30-60 seconds on first run (downloading ~80MB)...');
    }
    
    this.loadPromise = pipeline('feature-extraction', this.modelName, {
      cache_dir: this.cacheDir,
      // Add some performance optimizations
      quantized: true, // Use quantized model for faster loading
      progress_callback: (progress) => {
        if (progress.status === 'downloading') {
          logger.info(`📥 Downloading: ${Math.round(progress.progress * 100)}%`);
        } else if (progress.status === 'loading') {
          logger.info(`🔄 Loading model: ${Math.round(progress.progress * 100)}%`);
        }
      }
    })
      .then(model => {
        const loadTime = Date.now() - startTime;
        this.model = model;
        this.isLoading = false;
        
        if (isCached) {
          logger.info(`✅ SentenceTransformers model loaded from cache successfully (${loadTime}ms)`);
        } else {
          logger.info(`✅ SentenceTransformers model downloaded and cached successfully (${loadTime}ms)`);
          logger.info(`📁 Model cached to: ${this.modelDir}`);
        }
        
        logger.info(`🚀 Model ready for inference! Load time: ${loadTime}ms`);
        return model;
      })
      .catch(error => {
        this.isLoading = false;
        this.loadPromise = null;
        logger.error('❌ Failed to load SentenceTransformers model:', error);
        throw error;
      });

    return this.loadPromise;
  }

  /**
   * Get the cached model or load it if not available
   */
  async getModel() {
    if (this.model) {
      return this.model;
    }
    return await this.initializeModel();
  }

  /**
   * Generate embedding using cached model
   */
  async generateEmbedding(text) {
    const model = await this.getModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return output.data;
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded() {
    return this.model !== null;
  }

  /**
   * Get cache status information
   */
  getCacheStatus() {
    const isCached = this.isModelCached();
    const isLoaded = this.isModelLoaded();
    const actualModelDir = path.join(this.cacheDir, 'Xenova', 'all-MiniLM-L6-v2');
    
    return {
      isCached,
      isLoaded,
      isLoading: this.isLoading,
      cacheDir: this.cacheDir,
      modelDir: actualModelDir, // Show the actual directory where files are stored
      modelName: this.modelName
    };
  }

  /**
   * Preload model (call this on server startup)
   */
  async preloadModel() {
    try {
      const status = this.getCacheStatus();
      const startTime = Date.now();
      
      if (status.isCached) {
        logger.info('🚀 Preloading SentenceTransformers model from cache...');
        logger.info('⏳ Loading cached model into memory (this may take 10-30 seconds)...');
      } else {
        logger.info('🚀 Preloading SentenceTransformers model (first-time download)...');
        logger.info('⏳ This will take 30-60 seconds on first startup...');
      }
      
      await this.initializeModel();
      
      const totalTime = Date.now() - startTime;
      
      if (status.isCached) {
        logger.info(`✅ Model preloaded successfully from cache (${totalTime}ms)`);
      } else {
        logger.info(`✅ Model preloaded successfully (downloaded and cached) (${totalTime}ms)`);
      }
      
      logger.info('🧠 AI Search is now ready for production use!');
      
    } catch (error) {
      logger.error('❌ Failed to preload model:', error);
      logger.warn('⚠️  AI Search will not be available until model loads successfully');
    }
  }
}

// Export singleton instance
export const modelService = new ModelService();
