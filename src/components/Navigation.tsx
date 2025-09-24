import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/somnia_logo_color.png"
              alt="Somnia Logo"
              className="h-8 w-8"
            />
            <h1 className="text-xl font-bold text-gray-800">
              Somnia Send
            </h1>
          </div>

          {/* Right side - Connect Wallet */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};