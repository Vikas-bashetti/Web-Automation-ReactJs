export const deploymentService = {
  async deployWebsites(appIds: string[]): Promise<void> {
    try {
      const response = await fetch('http://localhost:3001/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appIds }),
      });

      if (!response.ok) {
        throw new Error(`Deployment request failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Deployment initiated:', result);
    } catch (error) {
      console.error('Failed to initiate deployment:', error);
      throw error;
    }
  },

  async getDeploymentStatus(appId: string): Promise<any> {
    try {
      const response = await fetch(`http://localhost:3001/api/deployment-status/${appId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get deployment status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get deployment status:', error);
      throw error;
    }
  },

  async cancelDeployment(appId: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3001/api/deployment/${appId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel deployment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to cancel deployment:', error);
      throw error;
    }
  }
};