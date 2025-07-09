import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@components/ui";
import type { ReactNode, CSSProperties } from "react";

/**
 * Represents a single item in the operation menu, including its label, icon, click handler, and optional input properties.
 */
export interface OperationMenuItem {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  inputProps?: {
    type: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    className?: string;
    min?: number;
    max?: number;
    disabled?: boolean;
    [key: string]: any;
  };
  disabled?: boolean;
  group?: string;
  className?: string;
}

/**
 * Props for the OperationMenu component, including the list of items, trigger icon, and optional styling.
 */
export interface OperationMenuProps {
  items: OperationMenuItem[];
  triggerIcon: ReactNode;
  triggerBgColor?: string;
  position?: CSSProperties;
}

/**
 * Renders a popover menu for selecting and interacting with operations, supporting grouping, icons, and optional input fields for each item.
 */
export function OperationMenu({
  items,
  triggerIcon,
  triggerBgColor = "bg-gray-500 hover:bg-gray-600 text-white",
  position = { position: "absolute", top: 24, left: 24, zIndex: 30 },
}: OperationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group items by group property for separators
  const groupedItems = items.reduce<Record<string, OperationMenuItem[]>>((acc, item) => {
    const group = item.group || "default";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
  const groups = Object.keys(groupedItems);

  return (
    <div style={position}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={`p-3 ${triggerBgColor} rounded-full shadow-lg transition-all duration-200 cursor-pointer transform-gpu ${
              isOpen ? "scale-100" : "hover:scale-110"
            } active:scale-95`}
          >
            {triggerIcon}
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
            <div className="space-y-1">
              {groups.map((group, gi) => (
                <div key={group}>
                  {gi > 0 && (
                    <div className="border-t border-gray-200 dark:border-zinc-600 my-2"></div>
                  )}
                  {groupedItems[group].map((item, i) => (
                    <div
                      key={item.label + i}
                      onClick={!item.disabled && item.onClick ? item.onClick : undefined}
                      className={`flex items-center gap-3 px-2 py-1 rounded-lg transition-all duration-200 group min-h-[32px] ${
                        !item.disabled
                          ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                          : "opacity-50 cursor-not-allowed"
                      } ${item.className || ""}`}
                      style={{ minHeight: '32px' }}
                    >
                      <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                      <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center min-h-[28px]">
                        {item.label}
                      </span>
                      {item.inputProps && (
                        <input
                          {...item.inputProps}
                          onClick={e => {
                            e.stopPropagation();
                            item.inputProps?.onClick?.(e);
                          }}
                          className={`appearance-none w-16 px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded text-center text-gray-900 dark:text-white ${item.inputProps.className || ""}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
