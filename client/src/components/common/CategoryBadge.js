import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Heart, 
  User, 
  BookOpen 
} from 'lucide-react';

const CategoryBadge = ({ category, showIcon = true, size = 'sm' }) => {
  const categoryConfig = {
    work: {
      label: 'Work',
      icon: Briefcase,
      className: 'category-work'
    },
    health: {
      label: 'Health',
      icon: Heart,
      className: 'category-health'
    },
    personal: {
      label: 'Personal',
      icon: User,
      className: 'category-personal'
    },
    learning: {
      label: 'Learning',
      icon: BookOpen,
      className: 'category-learning'
    }
  };

  const config = categoryConfig[category] || categoryConfig.personal;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`category-badge ${config.className} ${sizeClasses[size]} inline-flex items-center space-x-1`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{config.label}</span>
    </motion.span>
  );
};

export default CategoryBadge; 