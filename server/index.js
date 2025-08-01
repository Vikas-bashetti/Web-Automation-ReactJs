import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DeploymentManager } from './services/deploymentManager.js';
import { GitService } from './services/gitService.js';
import { DockerService } from './services/dockerService.js';
import { AWSService } from './services/awsService.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize services
const gitService = new GitService();
const dockerService = new DockerService();
const awsService = new AWSService();
const deploymentManager = new DeploymentManager(io, gitService, dockerService, awsService);

// Routes
app.post('/api/deploy', async (req, res) => {
  try {
    const { appIds, force = false } = req.body;
    
    if (!appIds || !Array.isArray(appIds) || appIds.length === 0) {
      return res.status(400).json({ error: 'appIds array is required' });
    }

    const deploymentId = await deploymentManager.startDeployment(appIds, { force });
    
    res.json({
      success: true,
      deploymentId,
      message: `Deployment started for ${appIds.length} applications`
    });
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ 
      error: 'Failed to start deployment',
      details: error.message 
    });
  }
});

app.get('/api/deployment-status/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const status = await deploymentManager.getDeploymentStatus(appId);
    
    res.json(status);
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ 
      error: 'Failed to get deployment status',
      details: error.message 
    });
  }
});

app.post('/api/deployment/:appId/cancel', async (req, res) => {
  try {
    const { appId } = req.params;
    await deploymentManager.cancelDeployment(appId);
    
    res.json({ success: true, message: 'Deployment cancelled' });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel deployment',
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Deployment server running on port ${PORT}`);
});