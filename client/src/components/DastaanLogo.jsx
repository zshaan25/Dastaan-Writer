import React from 'react';
import logoImg from '../assets/logo.png';

export function DastaanLogo({ size = 32, className = '' }) {
  return (
    <img
      src={logoImg}
      alt="Dastaan Logo"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`rounded-lg object-contain shrink-0 ${className}`}
    />
  );
}

export default DastaanLogo;
