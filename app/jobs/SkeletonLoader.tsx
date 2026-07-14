import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  type?: 'text' | 'rect' | 'circle';
  count?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  count = 1, 
  width, 
  height, 
  className = '',
  style 
}) => {
  const skeletons = Array.from({ length: count }).map((_, index) => {
    const styles: React.CSSProperties = { ...style };
    if (width) styles.width = width;
    if (height) styles.height = height;

    return (
      <div 
        key={index} 
        className={`skeleton ${type} ${className}`} 
        style={styles} 
      />
    );
  });

  return <>{skeletons}</>;
};

export default SkeletonLoader;