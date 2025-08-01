import { Website } from '../types';

// Mock data - replace with actual API calls
const mockWebsites: Website[] = [
  {
    appId: 'store-001',
    appName: 'Fashion Store NYC',
    description: 'Premium fashion retailer in New York City',
    environment: 'production',
    region: 'us-east-1',
    ecsCluster: 'production-cluster',
    ecsService: 'fashion-store-nyc',
    ecrRepository: 'fashion-stores/store-001',
    gitBranch: 'store-001',
    lastDeployed: '2024-01-15T10:30:00Z',
    currentVersion: 'v1.2.3'
  },
  {
    appId: 'store-002',
    appName: 'Tech Gadgets LA',
    description: 'Electronics and gadgets store in Los Angeles',
    environment: 'production',
    region: 'us-west-2',
    ecsCluster: 'production-cluster',
    ecsService: 'tech-gadgets-la',
    ecrRepository: 'tech-stores/store-002',
    gitBranch: 'store-002',
    lastDeployed: '2024-01-14T15:45:00Z',
    currentVersion: 'v1.2.1'
  },
  {
    appId: 'store-003',
    appName: 'Home Decor Miami',
    description: 'Modern home decoration and furniture store',
    environment: 'staging',
    region: 'us-east-1',
    ecsCluster: 'staging-cluster',
    ecsService: 'home-decor-miami',
    ecrRepository: 'home-stores/store-003',
    gitBranch: 'store-003',
    lastDeployed: '2024-01-13T09:20:00Z',
    currentVersion: 'v1.1.8'
  }
];

// Generate additional mock websites to reach 500
// for (let i = 4; i <= 500; i++) {
//   const storeId = `store-${i.toString().padStart(3, '0')}`;
//   const environments = ['production', 'staging', 'development'] as const;
//   const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
//   const categories = ['Fashion', 'Electronics', 'Books', 'Sports', 'Home', 'Beauty', 'Automotive', 'Toys'];
//   const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
  
//   const category = categories[Math.floor(Math.random() * categories.length)];
//   const city = cities[Math.floor(Math.random() * cities.length)];
//   const environment = environments[Math.floor(Math.random() * environments.length)];
//   const region = regions[Math.floor(Math.random() * regions.length)];
  
//   mockWebsites.push({
//     appId: storeId,
//     appName: `${category} Store ${city}`,
//     description: `${category} retailer serving the ${city} area`,
//     environment,
//     region,
//     ecsCluster: `${environment}-cluster`,
//     ecsService: `${category.toLowerCase()}-store-${city.toLowerCase().replace(' ', '-')}`,
//     ecrRepository: `${category.toLowerCase()}-stores/${storeId}`,
//     gitBranch: storeId,
//     lastDeployed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
//     currentVersion: `v1.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`
//   });
// }

export const websiteService = {
  async getWebsites(): Promise<Website[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockWebsites;
  },

  async getWebsite(appId: string): Promise<Website | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockWebsites.find(w => w.appId === appId) || null;
  },

  async updateWebsite(appId: string, updates: Partial<Website>): Promise<Website | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockWebsites.findIndex(w => w.appId === appId);
    if (index !== -1) {
      mockWebsites[index] = { ...mockWebsites[index], ...updates };
      return mockWebsites[index];
    }
    return null;
  }
};