import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { DeploymentStatus } from '../types';
import StatusBadge from './StatusBadge';

interface DeploymentModalProps {
  selectedWebsites: string[];
  deploymentStatus: Record<string, DeploymentStatus>;
  onClose: () => void;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({
  selectedWebsites,
  deploymentStatus,
  onClose
}) => {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleLogs = (appId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(appId)) {
      newExpanded.delete(appId);
    } else {
      newExpanded.add(appId);
    }
    setExpandedLogs(newExpanded);
  };

  const getOverallProgress = () => {
    const totalApps = selectedWebsites.length;
    const completedApps = selectedWebsites.filter(appId => {
      const status = deploymentStatus[appId]?.status;
      return status === 'completed' || status === 'failed';
    }).length;
    
    return Math.round((completedApps / totalApps) * 100);
  };

  const canClose = () => {
    return selectedWebsites.every(appId => {
      const status = deploymentStatus[appId]?.status;
      return status === 'completed' || status === 'failed';
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Deployment Progress
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Deploying {selectedWebsites.length} websites
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={!canClose()}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{getOverallProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {selectedWebsites.map((appId) => {
              const status = deploymentStatus[appId];
              const isExpanded = expandedLogs.has(appId);
              
              return (
                <div key={appId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {status?.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {status?.status === 'failed' && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        {(status?.status === 'building' || status?.status === 'deploying') && (
                          <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
                        )}
                        {(!status || status.status === 'idle') && (
                          <div className="w-5 h-5 bg-gray-300 rounded-full" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{appId}</h4>
                        <p className="text-sm text-gray-600">
                          {status?.stage || 'Waiting to start...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={status?.status || 'idle'} />
                      {status?.logs && status.logs.length > 0 && (
                        <button
                          onClick={() => toggleLogs(appId)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {status && status.status !== 'idle' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            status.status === 'failed' 
                              ? 'bg-red-500' 
                              : status.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{status.progress}%</span>
                        {status.startTime && (
                          <span>
                            Started: {new Date(status.startTime).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {status?.error && (
                    <div className="mt-3 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-700">{status.error}</p>
                    </div>
                  )}

                  {isExpanded && status?.logs && (
                    <div className="mt-3 bg-gray-900 rounded-md p-3 max-h-40 overflow-y-auto">
                      <div className="text-sm font-mono text-gray-100 space-y-1">
                        {status.logs.map((log, index) => (
                          <div key={index} className="whitespace-pre-wrap">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={!canClose()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canClose() ? 'Close' : 'Deploying...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentModal;