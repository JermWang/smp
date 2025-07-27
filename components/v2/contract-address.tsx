"use client";

import { useState } from 'react';

export function ContractAddress() {
  const [copied, setCopied] = useState(false);
  const contractAddress = "0xf800a81B454c666390Cf7b61462c9B18dE23ada8";
  const truncatedAddress = `${contractAddress.slice(0, 8)}...${contractAddress.slice(-6)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="relative z-50 mt-4 sm:mt-6">
      <button
        onClick={copyToClipboard}
        className="group relative overflow-hidden rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 ease-out hover:scale-105"
        style={{
          boxShadow: '0 4px 16px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        }}
      >
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="text-xs font-mono text-white/80 tracking-wide">
            <span className="sm:hidden">{truncatedAddress}</span>
            <span className="hidden sm:inline">{contractAddress}</span>
          </div>
          <div className="flex items-center">
            {copied ? (
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/60 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Glassmorphic shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent transform -skew-x-12 animate-pulse"></div>
        </div>
        
        {/* Copy feedback text */}
        {copied && (
          <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 text-xs text-green-400 font-medium">
            Copied!
          </div>
        )}
      </button>
    </div>
  );
} 