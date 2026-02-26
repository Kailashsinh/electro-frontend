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
                <img
                    src="/loogoo.png"
                    alt="ElectroCare Logo"
                    className={iconOnly ? "h-10 w-10 object-contain" : "h-12 md:h-16 w-auto object-contain"}
                />
            </motion.div>
        </div>
    );
};

export default Logo;
