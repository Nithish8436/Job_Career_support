import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export const Dropdown = ({ trigger, children, align = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>
            {isOpen && (
                <div className={cn(
                    "absolute top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50",
                    align === 'right' ? 'right-0' : 'left-0'
                )}>
                    {children}
                </div>
            )}
        </div>
    );
};

export const DropdownItem = ({ children, onClick, icon: Icon, variant = 'default' }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors",
                variant === 'danger'
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50"
            )}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};

export const DropdownDivider = () => {
    return <div className="h-px bg-gray-200 my-1" />;
};
