import { v4 as uuidv4 } from 'uuid';

export class DeploymentManager {
  constructor(io, gitService, dockerService, awsService) {
    this.io = io;
    this.gitService = gitService;
    this.dockerService = dockerService;
    this.awsService = awsService;
    this.deployments = new Map();
    this.queue = [];
    this.isProcessing = false;
  }

  async startDeployment(appIds, options = {}) {
    const deploymentId = uuidv4();
    
    // Initialize deployment status for each app
    for (const appId of appIds) {
      const status = {
        appId,
        deploymentId,
        status: 'idle',
        progress: 0,
        stage: 'Queued',
        logs: [],
        startTime: null,
        endTime: null,
        error: null,
        version: null
      };
      
      this.deployments.set(appId, status);
      this.queue.push({ appId, options });
    }

    // Start processing queue
    this.processQueue();
    
    return deploymentId;
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 3); // Process 3 at a time
      
      await Promise.all(
        batch.map(item => this.deployApp(item.appId, item.options))
      );
    }

    this.isProcessing = false;
  }

  async deployApp(appId, options) {
    const status = this.deployments.get(appId);
    if (!status) return;

    try {
      status.startTime = new Date().toISOString();
      status.status = 'building';
      status.stage = 'Preparing deployment';
      status.progress = 5;
      this.emitStatusUpdate(status);

      // Step 1: Clone main repository
      status.stage = 'Cloning main repository';
      status.progress = 10;
      this.addLog(status, 'Cloning main repository...');
      this.emitStatusUpdate(status);
      
      const mainRepoPath = await this.gitService.cloneMainRepo();
      this.addLog(status, `Main repository cloned to ${mainRepoPath}`);

      // Step 2: Clone app-specific files
      status.stage = 'Fetching app-specific files';
      status.progress = 20;
      this.addLog(status, `Fetching files for app ${appId}...`);
      this.emitStatusUpdate(status);
      
      const appFilesPath = await this.gitService.cloneAppFiles(appId);
      this.addLog(status, `App files cloned to ${appFilesPath}`);

      // Step 3: Merge files
      status.stage = 'Merging application files';
      status.progress = 30;
      this.addLog(status, 'Merging main build with app-specific files...');
      this.emitStatusUpdate(status);
      
      const buildPath = await this.gitService.mergeFiles(mainRepoPath, appFilesPath, appId);
      this.addLog(status, `Files merged successfully`);

      // Step 4: Build Docker image
      status.stage = 'Building Docker image';
      status.progress = 50;
      this.addLog(status, 'Building Docker image...');
      this.emitStatusUpdate(status);
      
      const imageTag = await this.dockerService.buildImage(buildPath, appId);
      status.version = imageTag;
      this.addLog(status, `Docker image built: ${imageTag}`);

      // Step 5: Push to ECR
      status.stage = 'Pushing to ECR';
      status.progress = 70;
      this.addLog(status, 'Pushing image to ECR...');
      this.emitStatusUpdate(status);
      
      await this.dockerService.pushToECR(imageTag, appId);
      this.addLog(status, `Image pushed to ECR: ${imageTag}`);

      // Step 6: Update ECS service
      status.status = 'deploying';
      status.stage = 'Updating ECS service';
      status.progress = 85;
      this.addLog(status, 'Updating ECS service...');
      this.emitStatusUpdate(status);
      
      await this.awsService.updateECSService(appId, imageTag);
      this.addLog(status, 'ECS service updated successfully');

      // Step 7: Wait for deployment to stabilize
      status.stage = 'Waiting for deployment';
      status.progress = 95;
      this.addLog(status, 'Waiting for service to stabilize...');
      this.emitStatusUpdate(status);
      
      await this.awsService.waitForDeployment(appId);

      // Complete
      status.status = 'completed';
      status.stage = 'Deployment completed';
      status.progress = 100;
      status.endTime = new Date().toISOString();
      this.addLog(status, 'Deployment completed successfully!');
      this.emitStatusUpdate(status);

    } catch (error) {
      console.error(`Deployment failed for ${appId}:`, error);
      
      status.status = 'failed';
      status.stage = 'Deployment failed';
      status.error = error.message;
      status.endTime = new Date().toISOString();
      this.addLog(status, `ERROR: ${error.message}`);
      this.emitStatusUpdate(status);
    }
  }

  getDeploymentStatus(appId) {
    return this.deployments.get(appId) || null;
  }

  async cancelDeployment(appId) {
    const status = this.deployments.get(appId);
    if (status && (status.status === 'building' || status.status === 'deploying')) {
      status.status = 'failed';
      status.stage = 'Cancelled';
      status.error = 'Deployment cancelled by user';
      status.endTime = new Date().toISOString();
      this.addLog(status, 'Deployment cancelled');
      this.emitStatusUpdate(status);
    }
  }

  addLog(status, message) {
    const timestamp = new Date().toISOString();
    status.logs.push(`[${timestamp}] ${message}`);
    
    // Keep only last 100 log entries
    if (status.logs.length > 100) {
      status.logs = status.logs.slice(-100);
    }
  }

  emitStatusUpdate(status) {
    this.io.emit('deploymentUpdate', status);
    
    if (status.status === 'completed' || status.status === 'failed') {
      this.io.emit('deploymentComplete', status);
    }
  }
}