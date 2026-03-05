"use client";

import { CategoryResponse } from "@/app/generated";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: CategoryResponse[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onCategoryChange(null)}
        className="h-8"
      >
        All Categories
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
          className="h-8"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
