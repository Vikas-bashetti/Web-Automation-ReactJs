import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Server, GitBranch } from 'lucide-react';
import { Website, DeploymentStatus } from '../types';
import StatusBadge from './StatusBadge';

interface WebsiteCardProps {
  website: Website;
  isSelected: boolean;
  onSelect: (appId: string) => void;
  deploymentStatus?: DeploymentStatus;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  isSelected,
  onSelect,
  deploymentStatus
}) => {
  const getStatusIcon = () => {
    if (!deploymentStatus) return <Server className="w-4 h-4 text-gray-400" />;
    
    switch (deploymentStatus.status) {
      case 'building':
      case 'deploying':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Server className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressBar = () => {
    if (!deploymentStatus || deploymentStatus.status === 'idle') return null;
    
    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{deploymentStatus.stage}</span>
          <span>{deploymentStatus.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              deploymentStatus.status === 'failed' 
                ? 'bg-red-500' 
                : deploymentStatus.status === 'completed'
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${deploymentStatus.progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(website.appId)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {website.appName}
              </h3>
              {getStatusIcon()}
            </div>
            <p className="text-sm text-gray-500 mt-1">ID: {website.appId}</p>
          </div>
          <div className="ml-4">
            <StatusBadge 
              status={deploymentStatus?.status || 'idle'} 
            />
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {website.description}
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <Server className="w-3 h-3 mr-1" />
            <span>{website.environment} • {website.region}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <GitBranch className="w-3 h-3 mr-1" />
            <span>{website.gitBranch}</span>
          </div>
        </div>

        {getProgressBar()}

        {website.lastDeployed && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Last deployed: {new Date(website.lastDeployed).toLocaleDateString()}
            </p>
            {website.currentVersion && (
              <p className="text-xs text-gray-500">
                Version: {website.currentVersion}
              </p>
            )}
          </div>
        )}

        {deploymentStatus?.error && (
          <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            {deploymentStatus.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteCard;