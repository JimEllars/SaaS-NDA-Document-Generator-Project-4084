import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const SafeIcon = ({ icon, ...props }) => {
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, props);
  }

  const IconComponent = icon;

  return IconComponent
    ? React.createElement(IconComponent, props)
    : <FiAlertTriangle {...props} />;
};

export default SafeIcon;
