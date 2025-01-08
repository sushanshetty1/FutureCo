import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { X, Check } from "lucide-react";

const categories = [
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Artificial Intelligence",
  "Data Science",
  "Cloud Computing",
  "DevOps",
  "Blockchain",
  "Cybersecurity",
  "UI/UX Design",
  "Game Development",
  "IoT",
  "AR/VR",
  "E-commerce",
  "FinTech"
];

const CategorySelector = ({ selectedCategories, setSelectedCategories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const removeCategory = (categoryToRemove) => {
    setSelectedCategories(prev =>
      prev.filter(category => category !== categoryToRemove)
    );
  };

  return (
    <div className="space-y-2">
      <Label className="text-white text-base">Categories</Label>
      
      {/* Selected Categories */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedCategories.map(category => (
          <span
            key={category}
            className="bg-[#a6ff00]/10 text-[#a6ff00] px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {category}
            <button
              onClick={() => removeCategory(category)}
              className="hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Search and dropdown */}
      <div className="relative">
        <input
          type="text"
          className="w-full bg-[#1f1f1f] border border-white/10 text-white h-12 px-4 rounded-md"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-[#1f1f1f] border border-white/10 rounded-md max-h-60 overflow-y-auto">
            {filteredCategories.map(category => (
              <button
                key={category}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/5 flex items-center justify-between"
                onClick={() => toggleCategory(category)}
              >
                {category}
                {selectedCategories.includes(category) && (
                  <Check className="w-4 h-4 text-[#a6ff00]" />
                )}
              </button>
            ))}
            {filteredCategories.length === 0 && (
              <div className="px-4 py-2 text-white/50">No categories found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;