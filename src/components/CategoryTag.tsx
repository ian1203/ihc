import React from 'react';
import './CategoryTag.css';

export interface CategoryTagProps {
  category: 'Trabajo' | 'Personal' | 'Compras';
}

export const CategoryTag: React.FC<CategoryTagProps> = ({ category }) => {
  return (
    <span className="ff-category-tag" aria-label={`Categoría: ${category}`}>
      {category}
    </span>
  );
};

