import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", iconOnly = false }) => {
    return (
        <div className={`flex items-center group select-none ${className}`}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative flex items-center"
            >
                <svg
                    viewBox={iconOnly ? "30 30 180 200" : "0 0 1000 300"}
                    className={iconOnly ? "h-10 w-10 overflow-visible" : "h-12 md:h-16 w-auto overflow-visible"}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#2563EB" />
                            <stop offset="50%" stopColor="#06B6D4" />
                            <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>

                        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.15" />
                        </filter>
                    </defs>

                    {/* Icon Group */}
                    <g transform="translate(80,60)" filter="url(#softGlow)">
                        <circle cx="80" cy="80" r="70" stroke="url(#premiumGradient)" strokeWidth="6" fill="none" />
                        <polygon points="75,40 105,90 85,90 110,140 60,95 80,95" fill="url(#premiumGradient)" />
                    </g>

                    {!iconOnly && (
                        <g>
                            <text x="220" y="150"
                                fontFamily="Orbitron, Segoe UI, Arial, sans-serif"
                                fontSize="80"
                                fontWeight="700"
                                fill="url(#premiumGradient)"
                                letterSpacing="4"
                                filter="url(#softGlow)">
                                ElectroCare
                            </text>
                            <text x="225" y="200"
                                fontFamily="Segoe UI, Arial, sans-serif"
                                fontSize="24"
                                fill="#334155"
                                letterSpacing="6"
                                filter="url(#shadow)">
                                INTELLIGENT HOME MAINTENANCE
                            </text>
                        </g>
                    )}
                </svg>
            </motion.div>
        </div>
    );
};

export default Logo;
