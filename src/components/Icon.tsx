import * as LucideIcons from 'lucide-react';
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof LucideIcons;
  size?: number | string;
  className?: string;
}

let loggedLucideIcons = false;

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', ...props }) => {
  const LucideIcon = LucideIcons[name];
  console.log('Rendering Icon:', name, LucideIcon);

  if (!loggedLucideIcons) {
    console.log('Available LucideIcons:', Object.keys(LucideIcons));
    loggedLucideIcons = true;
  }

  if (!LucideIcon || typeof LucideIcon !== 'function') {
    console.warn(`Icon "${name}" is not a valid React component in lucide-react`);
    return <span style={{color: 'red', fontSize: size}}>?</span>;
  }

  const IconComponent = LucideIcon as React.ComponentType<any>;

  return (
    <IconComponent
      size={size}
      className={className}
      aria-hidden="true"
      {...props}
    />
  );
};

export default Icon; 