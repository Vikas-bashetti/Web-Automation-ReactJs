import React, { useState, useEffect } from 'react';
import { Search, Upload, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import WebsiteCard from './components/WebsiteCard';
import DeploymentModal from './components/DeploymentModal';
import StatusBadge from './components/StatusBadge';
import { Website, DeploymentStatus } from './types';
import { websiteService } from './services/websiteService';
import { deploymentService } from './services/deploymentService';
import io from 'socket.io-client';

function App() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsites, setSelectedWebsites] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deploymentStatus, setDeploymentStatus] = useState<Record<string, DeploymentStatus>>({});
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    loadWebsites();
    setupWebSocketConnection();
  }, []);

  const loadWebsites = async () => {
    const websiteData = await websiteService.getWebsites();
    setWebsites(websiteData);
  };

  const setupWebSocketConnection = () => {
    const socket = io('http://localhost:3001');
    
    socket.on('deploymentUpdate', (data) => {
      setDeploymentStatus(prev => ({
        ...prev,
        [data.appId]: data
      }));
    });

    socket.on('deploymentComplete', (data) => {
      setDeploymentStatus(prev => ({
        ...prev,
        [data.appId]: data
      }));
      if (data.status === 'completed' || data.status === 'failed') {
        setIsDeploying(false);
      }
    });
  };

  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.appId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const status = deploymentStatus[website.appId]?.status || 'idle';
    return matchesSearch && status === filterStatus;
  });

  const handleWebsiteSelect = (appId: string) => {
    const newSelected = new Set(selectedWebsites);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedWebsites(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedWebsites.size === filteredWebsites.length) {
      setSelectedWebsites(new Set());
    } else {
      setSelectedWebsites(new Set(filteredWebsites.map(w => w.appId)));
    }
  };

  const handleDeploy = async () => {
    if (selectedWebsites.size === 0) return;
    
    setIsDeploying(true);
    setShowDeploymentModal(true);
    
    const selectedApps = Array.from(selectedWebsites);
    await deploymentService.deployWebsites(selectedApps);
  };

  const getStatusStats = () => {
    const stats = { idle: 0, building: 0, deploying: 0, completed: 0, failed: 0 };
    websites.forEach(website => {
      const status = deploymentStatus[website.appId]?.status || 'idle';
      stats[status as keyof typeof stats]++;
    });
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ECS Deployment Pipeline</h1>
              <p className="text-gray-600 mt-1">Manage deployments for {websites.length} websites</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadWebsites}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleDeploy}
                disabled={selectedWebsites.size === 0 || isDeploying}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4 mr-2" />
                Deploy Selected ({selectedWebsites.size})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Idle: {stats.idle}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Building: {stats.building}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Deploying: {stats.deploying}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Completed: {stats.completed}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Failed: {stats.failed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by app name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="idle">Idle</option>
              <option value="building">Building</option>
              <option value="deploying">Deploying</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {selectedWebsites.size === filteredWebsites.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Website Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWebsites.map((website) => (
            <WebsiteCard
              key={website.appId}
              website={website}
              isSelected={selectedWebsites.has(website.appId)}
              onSelect={handleWebsiteSelect}
              deploymentStatus={deploymentStatus[website.appId]}
            />
          ))}
        </div>
        
        {filteredWebsites.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No websites found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Deployment Modal */}
      {showDeploymentModal && (
        <DeploymentModal
          selectedWebsites={Array.from(selectedWebsites)}
          deploymentStatus={deploymentStatus}
          onClose={() => setShowDeploymentModal(false)}
        />
      )}
    </div>
  );
}

export default App;