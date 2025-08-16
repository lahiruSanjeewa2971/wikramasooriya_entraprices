import { spawn } from 'child_process';
import validateDatabaseConnection from './validate-db-connection.js';

const startServer = async () => {
  try {
    console.log('🚀 Starting Wikramasooriya Enterprises Backend...');
    console.log('🔍 Pre-flight database validation...');
    
    // Validate database connection first
    const isValid = await validateDatabaseConnection();
    
    if (!isValid) {
      console.error('\n❌ Database validation failed. Server cannot start.');
      console.log('\n🔧 Please fix the database issues and try again.');
      console.log('   Run: npm run db:validate');
      process.exit(1);
    }
    
    console.log('\n✅ Database validation passed. Starting server...');
    
    // Start the server
    const server = spawn('node', ['src/server.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });
    
    server.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down server...');
      server.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
};

startServer();
