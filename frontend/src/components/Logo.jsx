import React from 'react';
import { cn } from '../lib/utils';
import { Globe } from 'lucide-react';

const Logo = ({ className, showText = true, textClassName, iconOnly = false }) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Logo Icon */}
            <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden group-hover:shadow-blue-500/50 transition-all duration-300">
                    <Globe className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
            </div>

            {/* Logo Text */}
            {(showText && !iconOnly) && (
                <span className={cn(
                    "text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent",
                    textClassName
                )}>
                    CareerFlux
                </span>
            )}
        </div>
    );
};

export default Logo;
