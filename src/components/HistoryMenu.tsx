import { type ReactNode, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { History, Play, RotateCcw } from "lucide-react";

export interface HistoryOperation {
  id: string;
  type: string;
  description: string;
}

interface HistoryMenuProps {
  operations: HistoryOperation[];
  selectedOperationIndex: number;
  onSelectOperation: (index: number) => void;
  getOperationIcon: (operation: HistoryOperation) => ReactNode;
  onClearHistory: () => void;
  isExecuting?: boolean;
}

export function HistoryMenu({
  operations,
  selectedOperationIndex,
  onSelectOperation,
  getOperationIcon,
  onClearHistory,
  isExecuting = false
}: HistoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-6 right-6 z-30">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            className={`p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 cursor-pointer transform-gpu ${
              isOpen ? 'scale-100' : 'hover:scale-110'
            } active:scale-95`}
          >
            <History size={24} />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-96 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700"
          align="end"
          side="bottom"
          sideOffset={8}
          alignOffset={0}
          avoidCollisions={true}
          sticky="always"
        >
          <div className="flex flex-col">
            <div className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-zinc-600 pb-2">
              {operations.length} operations in timeline
            </div>
            <div className="max-h-80 overflow-y-auto">
              <div className="relative">
                {/* Timeline line - only show when there are operations */}
                {operations.length > 0 && (
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300 dark:bg-zinc-600"></div>
                )}
                
                {operations.map((entry, index) => (
                  <div
                    key={entry.id}
                    onClick={() => onSelectOperation(index)}
                    className={`relative flex items-start gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50 group ${
                      selectedOperationIndex === index 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm' 
                        : ''
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      selectedOperationIndex === index
                        ? 'bg-blue-500 border-blue-500 shadow-lg'
                        : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 group-hover:border-blue-400 dark:group-hover:border-blue-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        selectedOperationIndex === index
                          ? 'bg-white'
                          : 'bg-gray-400 dark:bg-zinc-500 group-hover:bg-blue-400 dark:group-hover:bg-blue-500'
                      }`}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`flex items-center justify-center w-6 h-6 rounded transition-all duration-200 ${
                          selectedOperationIndex === index
                            ? 'bg-blue-100 dark:bg-blue-900/40'
                            : 'bg-gray-100 dark:bg-zinc-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
                        }`}>
                          {getOperationIcon(entry)}
                        </div>
                        <span className={`text-sm font-medium transition-all duration-200 ${
                          selectedOperationIndex === index
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        }`}>
                          {entry.description}
                        </span>
                        {/* Play icon hint on hover */}
                        <div className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                          selectedOperationIndex === index ? 'hidden' : ''
                        }`}>
                          <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono transition-all duration-200 ${
                          selectedOperationIndex === index
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                        }`}>
                          Step #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty state message */}
                {operations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                      <History className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No operations yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Perform operations to see them here</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Clear History Button */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-600">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClearHistory();
                }}
                disabled={isExecuting || operations.length === 0}
                className="w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw className="w-5 h-5" />
                Clear History ({operations.length})
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
