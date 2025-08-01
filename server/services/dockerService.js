import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export class DockerService {
  constructor() {
    this.ecrRegistry = process.env.ECR_REGISTRY || '123456789012.dkr.ecr.us-east-1.amazonaws.com';
    this.awsRegion = process.env.AWS_REGION || 'us-east-1';
  }

  async buildImage(buildPath, appId) {
    const timestamp = Date.now();
    const version = `v${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${timestamp.toString().slice(-6)}`;
    const imageTag = `${this.ecrRegistry}/${appId}:${version}`;
    
    // Ensure Dockerfile exists
    const dockerfilePath = path.join(buildPath, 'Dockerfile');
    if (!(await this.fileExists(dockerfilePath))) {
      await this.createDefaultDockerfile(dockerfilePath);
    }
    
    await this.runCommand('docker', [
      'build',
      '-t', imageTag,
      '--build-arg', `APP_ID=${appId}`,
      '--build-arg', `VERSION=${version}`,
      buildPath
    ]);
    
    return imageTag;
  }

  async pushToECR(imageTag, appId) {
    // Authenticate with ECR
    await this.runCommand('aws', [
      'ecr', 'get-login-password',
      '--region', this.awsRegion
    ]).then(async (password) => {
      await this.runCommand('docker', [
        'login',
        '--username', 'AWS',
        '--password-stdin',
        this.ecrRegistry
      ], password.trim());
    });
    
    // Create repository if it doesn't exist
    try {
      await this.runCommand('aws', [
        'ecr', 'create-repository',
        '--repository-name', appId,
        '--region', this.awsRegion
      ]);
    } catch (error) {
      // Repository might already exist, continue
      if (!error.message?.includes('RepositoryAlreadyExistsException')) {
        throw error;
      }
    }
    
    // Push image
    await this.runCommand('docker', ['push', imageTag]);
  }

  async createDefaultDockerfile(dockerfilePath) {
    const dockerfile = `
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration if exists
COPY nginx.conf /etc/nginx/nginx.conf 2>/dev/null || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
    `.trim();
    
    await fs.writeFile(dockerfilePath, dockerfile);
  }

  async runCommand(command, args, input = null) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: input ? ['pipe', 'pipe', 'pipe'] : ['inherit', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      if (process.stdout) {
        process.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }
      
      if (process.stderr) {
        process.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }
      
      if (input && process.stdin) {
        process.stdin.write(input);
        process.stdin.end();
      }
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}