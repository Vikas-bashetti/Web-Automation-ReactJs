# ECS Deployment Pipeline

An automated deployment pipeline for managing 500+ websites hosted on AWS ECS Fargate using Docker containers.

## Features

- **Multi-Website Management**: Select and deploy multiple websites simultaneously
- **Git Integration**: Automatically pulls main build and app-specific files from Git repositories
- **Docker Automation**: Builds and pushes Docker images to ECR with versioning
- **ECS Integration**: Updates ECS Fargate services with zero-downtime deployments
- **Real-time Monitoring**: Live deployment status with detailed logs
- **Queue Management**: Handles concurrent deployments efficiently

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Node.js API   │    │   AWS Services  │
│                 │    │                 │    │                 │
│ • Website List  │◄──►│ • Git Service   │◄──►│ • ECR           │
│ • Deployment UI │    │ • Docker Build  │    │ • ECS Fargate   │
│ • Status Monitor│    │ • AWS Deploy    │    │ • CloudWatch    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker
- AWS CLI configured
- Git access to your repositories

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecs-deployment-pipeline
```

2. Run setup script:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your AWS credentials and repository URLs
```

4. Start development server:
```bash
npm run dev
```

### Configuration

#### Environment Variables

```env
# Git Configuration
MAIN_REPO_URL=https://github.com/your-org/main-build.git
APP_REPO_URL=https://github.com/your-org/app-configs.git
MAIN_BRANCH=main

# AWS Configuration
AWS_REGION=us-east-1
ECR_REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# ECS Configuration
PRODUCTION_CLUSTER=production-cluster
STAGING_CLUSTER=staging-cluster
```

#### Repository Structure

**Main Repository** (shared base code):
```
main-build/
├── src/
├── package.json
├── Dockerfile
└── ...
```

**App-Specific Repository** (per-app customizations):
```
app-configs/
├── branches/
│   ├── store-001/
│   │   ├── src/
│   │   ├── config.json
│   │   └── .env
│   ├── store-002/
│   └── ...
```

## Usage

### Deploying Websites

1. **Select Websites**: Use the search and filter options to find your target websites
2. **Multi-Select**: Click on website cards to select multiple sites for batch deployment
3. **Deploy**: Click "Deploy Selected" to start the automated pipeline
4. **Monitor**: Watch real-time progress in the deployment modal

### Deployment Process

Each deployment follows these automated steps:

1. **Repository Cloning**: Pulls latest main build and app-specific files
2. **File Merging**: Combines base code with app customizations
3. **Docker Build**: Creates optimized Docker image with versioning
4. **ECR Push**: Uploads image to your container registry
5. **ECS Update**: Updates Fargate service with zero downtime
6. **Health Check**: Waits for deployment to stabilize

### Monitoring & Logs

- **Real-time Status**: Live updates on deployment progress
- **Detailed Logs**: Complete build and deployment logs
- **Error Handling**: Automatic rollback on failures
- **History Tracking**: Deployment history and version management

## API Reference

### Endpoints

- `POST /api/deploy` - Start deployment for selected apps
- `GET /api/deployment-status/:appId` - Get deployment status
- `POST /api/deployment/:appId/cancel` - Cancel active deployment
- `GET /api/health` - Health check endpoint

### WebSocket Events

- `deploymentUpdate` - Real-time deployment progress
- `deploymentComplete` - Deployment completion notification

## Production Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

### Using Kubernetes

```bash
kubectl apply -f k8s/
```

### AWS ECS Deployment

The system can be deployed on ECS itself for a complete AWS-native solution.

## Security Considerations

- **IAM Roles**: Use least-privilege IAM roles for AWS access
- **VPC Security**: Deploy within private subnets with proper security groups
- **Secret Management**: Use AWS Secrets Manager for sensitive configuration
- **Git Access**: Use deploy keys or service accounts for repository access

## Troubleshooting

### Common Issues

1. **Docker Build Failures**: Check Dockerfile syntax and build context
2. **ECR Authentication**: Ensure AWS credentials have ECR permissions
3. **ECS Deployment Issues**: Verify service configuration and task definitions
4. **Git Access**: Check repository URLs and authentication

### Logs and Debugging

- Application logs: Available in deployment modal
- Server logs: `docker-compose logs deployment-pipeline`
- AWS CloudWatch: ECS service and task logs

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details