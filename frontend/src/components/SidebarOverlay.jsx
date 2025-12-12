// components/SidebarOverlay.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarOverlay = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          {children}
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarOverlay;