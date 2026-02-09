import React from 'react';
import { motion } from 'motion/react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  whileHover?: any;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0,
  onClick,
  whileHover = { scale: 1.02, y: -5 }
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={whileHover}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}
