import React from 'react';
import LoadingState from './LoadingState';

const LoadingSpinner: React.FC = () => {
  return <LoadingState variant="fullscreen" message="Loading..." size="lg" />;
};

export default LoadingSpinner; 