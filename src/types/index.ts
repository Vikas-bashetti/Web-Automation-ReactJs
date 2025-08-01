export interface Website {
  appId: string;
  appName: string;
  description: string;
  environment: 'production' | 'staging' | 'development';
  region: string;
  ecsCluster: string;
  ecsService: string;
  ecrRepository: string;
  gitBranch: string;
  lastDeployed?: string;
  currentVersion?: string;
}

export interface DeploymentStatus {
  appId: string;
  status: 'idle' | 'building' | 'deploying' | 'completed' | 'failed';
  progress: number;
  stage: string;
  logs: string[];
  startTime?: string;
  endTime?: string;
  error?: string;
  version?: string;
}

export interface DeploymentRequest {
  appIds: string[];
  force?: boolean;
  rollback?: boolean;
}

export interface BuildConfig {
  mainBranch: string;
  dockerFile: string;
  buildArgs: Record<string, string>;
  ecrRegistry: string;
  awsRegion: string;
}