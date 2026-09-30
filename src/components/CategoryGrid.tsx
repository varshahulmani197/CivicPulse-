import React from 'react';
import { 
  Hammer, 
  Lightbulb, 
  Droplets, 
  AlertTriangle, 
  Trash2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { CategoryType, CategoryMeta } from '../types';
import { CATEGORIES } from '../data/mockData';

interface CategoryGridProps {
  selectedCategory: CategoryType | 'all';
  onSelectCategory: (category: CategoryType | 'all') => void;
  categoryCounts: Record<CategoryType, number>;
  onDirectReportCategory: (category: CategoryType) => void;
}

const ICON_MAP: Record<CategoryType, React.ElementType> = {
  pothole: Hammer,
  streetlight: Lightbulb,
  water_leak: Droplets,
  open_drain: AlertTriangle,
  garbage: Trash2,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  onDirectReportCategory,
}) => {
  const totalAll = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <section className="my-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Urban Fault Categories
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Micro-Infrastructure Category Grid
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Click any category card to filter map & live feed, or report immediately.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 'All Categories' Option */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className={`p-2 rounded-lg ${selectedCategory === 'all' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
              selectedCategory === 'all' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}>
              {totalAll} Total
            </span>
          </div>

          <div>
            <div className="text-sm font-bold tracking-tight">All Reports</div>
            <div className={`text-[11px] mt-0.5 ${selectedCategory === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>
              Full City Grid
            </div>
          </div>
        </button>

        {/* 5 Main Categories */}
        {CATEGORIES.map((cat: CategoryMeta) => {
          const Icon = ICON_MAP[cat.id];
          const count = categoryCounts[cat.id] || 0;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              className={`relative group flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-white border-slate-900 shadow-lg ring-2 ring-amber-500/80 -translate-y-0.5'
                  : 'bg-white hover:bg-slate-50/80 hover:border-slate-300 border-slate-200 shadow-xs'
              }`}
            >
              {/* Category card main clickable body */}
              <div 
                onClick={() => onSelectCategory(cat.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div className={`p-2 rounded-lg ${cat.bgColorClass} ${cat.colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 mt-1">
                      {cat.defaultAgency}
                    </span>
                  </div>
                </div>

                <div className="min-h-[44px]">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                    {cat.emoji} {cat.shortLabel}
                  </h3>
                </div>
              </div>

              {/* Action footer */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => onSelectCategory(cat.id)}
                  className={`font-semibold transition-colors ${
                    isSelected ? 'text-amber-700 underline' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected ? 'Filtered' : 'Filter feed'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDirectReportCategory(cat.id);
                  }}
                  title={`Report new ${cat.shortLabel}`}
                  className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Report</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
