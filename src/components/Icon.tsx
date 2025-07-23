import * as LucideIcons from 'lucide-react';
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof LucideIcons;
  size?: number | string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', ...props }) => {
  const LucideIcon = LucideIcons[name];

  if (
    !LucideIcon ||
    typeof LucideIcon !== 'function' ||
    !LucideIcon.name ||
    LucideIcon.name[0] !== LucideIcon.name[0].toUpperCase()
  ) {
    console.warn(`Icon "${name}" is not a valid React component in lucide-react`);
    return null;
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