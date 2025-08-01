import React from 'react';

interface StatusBadgeProps {
  status: 'idle' | 'building' | 'deploying' | 'completed' | 'failed';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'building':
        return {
          text: 'Building',
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'deploying':
        return {
          text: 'Deploying',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'completed':
        return {
          text: 'Completed',
          className: 'bg-green-100 text-green-800',
        };
      case 'failed':
        return {
          text: 'Failed',
          className: 'bg-red-100 text-red-800',
        };
      default:
        return {
          text: 'Idle',
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;