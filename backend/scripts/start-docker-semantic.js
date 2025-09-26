#!/usr/bin/env node

import { spawn } from 'child_process';
import { logger } from '../src/utils/logger.js';

/**
 * Docker Semantic Search Container Startup Script
 * Starts the PostgreSQL with pgvector container for semantic search functionality
 */

const DOCKER_COMPOSE_FILE = 'docker-compose.semantic.yml';
const CONTAINER_NAME = 'wikramasooriya-postgres-pgvector';

class DockerSemanticManager {
  constructor() {
    this.isContainerRunning = false;
    this.startupTimeout = 30000; // 30 seconds timeout
  }

  /**
   * Check if Docker is available on the system
   */
  async checkDockerAvailable() {
    return new Promise((resolve) => {
      const dockerCheck = spawn('docker', ['--version'], { stdio: 'pipe' });
      
      dockerCheck.on('close', (code) => {
        resolve(code === 0);
      });
      
      dockerCheck.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Check if the semantic search container is already running
   */
  async isContainerRunning() {
    return new Promise((resolve) => {
      const dockerPs = spawn('docker', ['ps', '--filter', `name=${CONTAINER_NAME}`, '--format', '{{.Names}}'], { stdio: 'pipe' });
      
      let output = '';
      dockerPs.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      dockerPs.on('close', (code) => {
        resolve(code === 0 && output.trim() === CONTAINER_NAME);
      });
      
      dockerPs.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Start the Docker container using docker-compose
   */
  async startContainer() {
    return new Promise((resolve, reject) => {
      logger.info('🐳 Starting Docker semantic search container...');
      
      const dockerCompose = spawn('docker-compose', ['-f', DOCKER_COMPOSE_FILE, 'up', '-d'], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      dockerCompose.stdout.on('data', (data) => {
        output += data.toString();
      });

      dockerCompose.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      dockerCompose.on('close', (code) => {
        if (code === 0) {
          logger.info('✅ Docker semantic search container started successfully');
          resolve(true);
        } else {
          logger.error('❌ Failed to start Docker container:', errorOutput);
          reject(new Error(`Docker compose failed with code ${code}: ${errorOutput}`));
        }
      });

      dockerCompose.on('error', (error) => {
        logger.error('❌ Docker compose error:', error.message);
        reject(error);
      });
    });
  }

  /**
   * Wait for container to be healthy
   */
  async waitForContainerHealth() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Container health check timeout'));
      }, this.startupTimeout);

      const checkHealth = () => {
        const dockerInspect = spawn('docker', ['inspect', '--format', '{{.State.Health.Status}}', CONTAINER_NAME], { stdio: 'pipe' });
        
        let output = '';
        dockerInspect.stdout.on('data', (data) => {
          output += data.toString();
        });

        dockerInspect.on('close', (code) => {
          if (code === 0) {
            const healthStatus = output.trim();
            if (healthStatus === 'healthy') {
              clearTimeout(timeout);
              resolve(true);
            } else if (healthStatus === 'unhealthy') {
              clearTimeout(timeout);
              reject(new Error('Container is unhealthy'));
            } else {
              // Still starting, check again in 2 seconds
              setTimeout(checkHealth, 2000);
            }
          } else {
            clearTimeout(timeout);
            reject(new Error('Failed to check container health'));
          }
        });

        dockerInspect.on('error', () => {
          clearTimeout(timeout);
          reject(new Error('Failed to check container health'));
        });
      };

      checkHealth();
    });
  }

  /**
   * Main startup process
   */
  async startSemanticSearch() {
    try {
      // Check if Docker is available
      const dockerAvailable = await this.checkDockerAvailable();
      if (!dockerAvailable) {
        logger.warn('⚠️  Docker is not available on this system');
        logger.info('🔄 Semantic search will use fallback mode');
        return { success: false, reason: 'docker_not_available' };
      }

      // Check if container is already running
      const isRunning = await this.isContainerRunning();
      if (isRunning) {
        logger.info('✅ Docker semantic search container is already running');
        return { success: true, reason: 'already_running' };
      }

      // Start the container
      await this.startContainer();

      // Wait for container to be healthy
      logger.info('⏳ Waiting for container to be healthy...');
      await this.waitForContainerHealth();

      logger.info('🎉 Docker semantic search container is up and running!');
      logger.info(`📊 Container: ${CONTAINER_NAME}`);
      logger.info('🔍 Semantic search functionality is now available');
      
      return { success: true, reason: 'started' };

    } catch (error) {
      logger.error('❌ Failed to start Docker semantic search container:', error.message);
      logger.info('🔄 Semantic search will use fallback mode');
      return { success: false, reason: 'startup_failed', error: error.message };
    }
  }
}

// If this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new DockerSemanticManager();
  manager.startSemanticSearch()
    .then((result) => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error('❌ Startup script error:', error.message);
      process.exit(1);
    });
}

export { DockerSemanticManager };
