import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type = 'text', width, height, className = '', style = {} }) => {
  const customStyle = {
    width: width,
    height: height,
    ...style,
  };

  return <div className={`skeleton skeleton-${type} ${className}`} style={customStyle}></div>;
};

export default Skeleton;