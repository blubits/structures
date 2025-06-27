import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { FiSettings } from "react-icons/fi";
import { 
  Plus, 
  Search, 
  ArrowDown, 
  ArrowUp,
  Loader2
} from "lucide-react";

interface BSTOperationsMenuProps {
  isExecuting: boolean;
  onInsert: (value: number) => void;
  onSearch: (value: number) => void;
  onFindMin: () => void;
  onFindMax: () => void;
}

export function BSTOperationsMenu({
  isExecuting,
  onInsert,
  onSearch,
  onFindMin,
  onFindMax
}: BSTOperationsMenuProps) {
  const [searchValue, setSearchValue] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [insertValue, setInsertValue] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-6 left-6 z-30">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            className={`p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-all duration-200 cursor-pointer transform-gpu ${
              isOpen ? 'scale-100' : 'hover:scale-110'
            } active:scale-95`}
          >
            <FiSettings size={24} />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700"
          align="start"
          side="bottom"
          sideOffset={8}
          alignOffset={0}
          avoidCollisions={true}
          sticky="always"
        >
          <div className="flex flex-col space-y-1">
            {/* Insert Operation */}
            <div 
              className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
              onClick={(e) => {
                // Only trigger if we didn't click on the input
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.operation-button')) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Insert operation clicked', { isExecuting, insertValue });
                  if (!isExecuting) {
                    onInsert(insertValue);
                  }
                }
              }}
            >
              <div className="operation-button flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {isExecuting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-200" />
                )}
                Insert
              </div>
              <input
                type="number"
                value={insertValue}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setInsertValue(val);
                  }
                }}
                className="w-16 px-2 py-1 text-xs border rounded bg-white dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
                disabled={isExecuting}
              />
            </div>

            {/* Search Operation */}
            <div 
              className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
              onClick={(e) => {
                // Only trigger if we didn't click on the input
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.operation-button')) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Search operation clicked', { isExecuting, searchValue });
                  if (!isExecuting) {
                    onSearch(searchValue);
                  }
                }
              }}
            >
              <div className="operation-button flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {isExecuting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                ) : (
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-200" />
                )}
                Search
              </div>
              <input
                type="number"
                value={searchValue}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setSearchValue(val);
                  }
                }}
                className="w-16 px-2 py-1 text-xs border rounded bg-white dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
                disabled={isExecuting}
              />
            </div>

            {/* Separator */}
            <div className="h-px bg-gray-200 dark:bg-zinc-600 my-1"></div>

            {/* Find Min Operation */}
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isExecuting) {
                  onFindMin();
                }
              }}
              className="flex items-center gap-2 p-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 text-left cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
              style={{ opacity: isExecuting ? 0.5 : 1 }}
            >
              {isExecuting ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
              ) : (
                <ArrowDown className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-200" />
              )}
              Find Minimum
            </div>

            {/* Find Maximum */}
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isExecuting) {
                  onFindMax();
                }
              }}
              className="flex items-center gap-2 p-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 text-left cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
              style={{ opacity: isExecuting ? 0.5 : 1 }}
            >
              {isExecuting ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
              ) : (
                <ArrowUp className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-200" />
              )}
              Find Maximum
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
