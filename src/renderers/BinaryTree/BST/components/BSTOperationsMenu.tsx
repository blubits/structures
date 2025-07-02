import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../../../../components/ui/popover";
import { 
  Plus, 
  Search, 
  ArrowDown, 
  ArrowUp,
  Trash2,
  BookOpen,
  Menu
} from "lucide-react";
import type { BSTOperationController } from "../BSTOperationController";

interface BSTOperationsMenuProps {
  controller: BSTOperationController;
  isExecuting: boolean;
  onLoadExample: (type: 'search' | 'insert' | 'delete') => void;
}

export function BSTOperationsMenu({
  controller,
  isExecuting,
  onLoadExample
}: BSTOperationsMenuProps) {
  const [insertValue, setInsertValue] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [searchValue, setSearchValue] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [deleteValue, setDeleteValue] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [isOpen, setIsOpen] = useState(false);

  const handleInsert = () => {
    controller.insertWithStepping(insertValue);
    setInsertValue(Math.floor(Math.random() * 50) + 1);
    setIsOpen(false);
  };

  const handleSearch = () => {
    controller.searchWithStepping(searchValue);
    setSearchValue(Math.floor(Math.random() * 50) + 1);
    setIsOpen(false);
  };

  const handleDelete = () => {
    controller.delete(deleteValue);
    setDeleteValue(Math.floor(Math.random() * 50) + 1);
    setIsOpen(false);
  };

  const handleFindMin = () => {
    controller.findMinWithStepping();
    setIsOpen(false);
  };

  const handleFindMax = () => {
    controller.findMaxWithStepping();
    setIsOpen(false);
  };

  return (
    <div className="absolute top-6 left-6 z-30">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            className={`p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg transition-all duration-200 cursor-pointer transform-gpu ${
              isOpen ? 'scale-100' : 'hover:scale-110'
            } active:scale-95`}
          >
            <Menu size={24} />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700"
          align="start"
          side="bottom"
          sideOffset={8}
          alignOffset={0}
          avoidCollisions={true}
          sticky="always"
        >
          <div className="flex flex-col">
            <div className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-zinc-600 pb-2">
              BST Operations
            </div>
            
            <div className="space-y-1">
              {/* Insert Operation */}
              <div 
                onClick={!isExecuting ? handleInsert : undefined}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  !isExecuting ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-zinc-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">Insert</span>
                <input
                  type="number"
                  value={insertValue}
                  onChange={(e) => {
                    e.stopPropagation();
                    setInsertValue(parseInt(e.target.value) || 0);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded text-center"
                  min="1"
                  max="100"
                  disabled={isExecuting}
                />
              </div>

              {/* Search Operation */}
              <div 
                onClick={!isExecuting ? handleSearch : undefined}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  !isExecuting ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-zinc-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">Search</span>
                <input
                  type="number"
                  value={searchValue}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearchValue(parseInt(e.target.value) || 0);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded text-center"
                  min="1"
                  max="100"
                  disabled={isExecuting}
                />
              </div>

              {/* Delete Operation */}
              <div 
                onClick={!isExecuting ? handleDelete : undefined}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  !isExecuting ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-zinc-700 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">Delete</span>
                <input
                  type="number"
                  value={deleteValue}
                  onChange={(e) => {
                    e.stopPropagation();
                    setDeleteValue(parseInt(e.target.value) || 0);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded text-center"
                  min="1"
                  max="100"
                  disabled={isExecuting}
                />
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 dark:border-zinc-600 my-2"></div>

              {/* Find Min Operation */}
              <div 
                onClick={!isExecuting ? handleFindMin : undefined}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  !isExecuting ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-zinc-700 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
                  <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">Find Minimum</span>
              </div>

              {/* Find Max Operation */}
              <div 
                onClick={!isExecuting ? handleFindMax : undefined}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  !isExecuting ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-zinc-700 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                  <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">Find Maximum</span>
              </div>

              {/* Examples Section */}
              <div className="border-t border-gray-200 dark:border-zinc-600 pt-3 mt-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Load Example
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadExample('insert');
                      setIsOpen(false);
                    }}
                    disabled={isExecuting}
                    className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Insert
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadExample('search');
                      setIsOpen(false);
                    }}
                    disabled={isExecuting}
                    className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadExample('delete');
                      setIsOpen(false);
                    }}
                    disabled={isExecuting}
                    className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
