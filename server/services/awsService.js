import { ECSClient, UpdateServiceCommand, DescribeServicesCommand } from '@aws-sdk/client-ecs';
import { ECRClient, DescribeRepositoriesCommand } from '@aws-sdk/client-ecr';

export class AWSService {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.ecsClient = new ECSClient({ region: this.region });
    this.ecrClient = new ECRClient({ region: this.region });
    
    // Mock configuration - replace with your actual setup
    this.clusterMap = new Map([
      ['production', 'production-cluster'],
      ['staging', 'staging-cluster'],
      ['development', 'development-cluster']
    ]);
  }

  async updateECSService(appId, imageTag) {
    const cluster = this.getClusterForApp(appId);
    const serviceName = this.getServiceNameForApp(appId);
    
    // Create new task definition revision with updated image
    const taskDefinition = await this.createTaskDefinitionRevision(appId, imageTag);
    
    // Update service with new task definition
    const updateCommand = new UpdateServiceCommand({
      cluster,
      service: serviceName,
      taskDefinition: taskDefinition.taskDefinitionArn,
      forceNewDeployment: true
    });
    
    const result = await this.ecsClient.send(updateCommand);
    return result.service;
  }

  async createTaskDefinitionRevision(appId, imageTag) {
    // This is a simplified version - in reality you'd need to:
    // 1. Get the current task definition
    // 2. Update the image URI
    // 3. Register a new revision
    
    // For now, return a mock task definition
    return {
      taskDefinitionArn: `arn:aws:ecs:${this.region}:123456789012:task-definition/${appId}:${Date.now()}`
    };
  }

  async waitForDeployment(appId, maxWaitTime = 600000) { // 10 minutes
    const cluster = this.getClusterForApp(appId);
    const serviceName = this.getServiceNameForApp(appId);
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const describeCommand = new DescribeServicesCommand({
        cluster,
        services: [serviceName]
      });
      
      const result = await this.ecsClient.send(describeCommand);
      const service = result.services[0];
      
      if (service && service.deployments) {
        const primaryDeployment = service.deployments.find(d => d.status === 'PRIMARY');
        
        if (primaryDeployment && 
            primaryDeployment.runningCount === primaryDeployment.desiredCount &&
            primaryDeployment.rolloutState === 'COMPLETED') {
          return true;
        }
      }
      
      // Wait 30 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    throw new Error(`Deployment did not complete within ${maxWaitTime / 1000} seconds`);
  }

  getClusterForApp(appId) {
    // Extract environment from app ID or use mapping
    // This is a simplified example
    if (appId.includes('prod')) return this.clusterMap.get('production');
    if (appId.includes('staging')) return this.clusterMap.get('staging');
    return this.clusterMap.get('production'); // Default
  }

  getServiceNameForApp(appId) {
    // Convert app ID to service name
    // This could be customized based on your naming convention
    return appId.replace(/_/g, '-').toLowerCase();
  }
}