import { useState } from "react";
import { Plus, Search, ArrowDown, ArrowUp, Trash2, Menu } from "lucide-react";
import { useBST } from "@structures/BinaryTree/variants/BST";
import { createOperation } from "@/lib/core/types";
import {
  generateBSTInsertStates,
  generateBSTSearchStates,
  generateBSTFindMinStates,
  generateBSTFindMaxStates,
} from "@structures/BinaryTree/variants/BST/algorithms";
import { OperationMenu } from "@components/OperationsMenu";
import type { OperationMenuItem } from "@components/OperationsMenu";
import { loggers } from "@/lib/core";

interface BSTOperationsMenuProps {
  isExecuting: boolean;
}

/**
 * Menu component for BST operations (insert, search, delete, min, max) with input controls and action handlers.
 */
export function BSTOperationsMenu({ isExecuting }: BSTOperationsMenuProps) {
  const { historyController, currentState, setIsPlaying } = useBST();
  const [insertValue, setInsertValue] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [searchValue, setSearchValue] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [deleteValue, setDeleteValue] = useState(() => Math.floor(Math.random() * 50) + 1);

  const handleInsert = () => {
    const operation = createOperation(
      "insert",
      { value: insertValue },
      `Insert ${insertValue}`
    );
    const states = generateBSTInsertStates(currentState, insertValue);
    historyController.execute(operation, states);
    historyController.startSteppingThroughCurrentOperation();
    setIsPlaying(true); // Start autoplay
    setInsertValue(Math.floor(Math.random() * 50) + 1);
  };

  const handleSearch = () => {
    const operation = createOperation(
      "search",
      { value: searchValue },
      `Search for ${searchValue}`
    );
    const states = generateBSTSearchStates(currentState, searchValue);
    historyController.execute(operation, states);
    historyController.startSteppingThroughCurrentOperation();
    setIsPlaying(true); // Start autoplay
    setSearchValue(Math.floor(Math.random() * 50) + 1);
  };

  const handleDelete = () => {
    // TODO: Implement delete operation
    loggers.bst.warn("Delete operation not yet implemented");
    setDeleteValue(Math.floor(Math.random() * 50) + 1);
  };

  const handleFindMin = () => {
    const operation = createOperation("findMin", {}, "Find minimum value");
    const states = generateBSTFindMinStates(currentState);
    historyController.execute(operation, states);
    historyController.startSteppingThroughCurrentOperation();
    setIsPlaying(true); // Start autoplay
  };

  const handleFindMax = () => {
    const operation = createOperation("findMax", {}, "Find maximum value");
    const states = generateBSTFindMaxStates(currentState);
    historyController.execute(operation, states);
    historyController.startSteppingThroughCurrentOperation();
    setIsPlaying(true); // Start autoplay
  };

  const items: OperationMenuItem[] = [
    {
      label: "Insert",
      icon: <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />,
      onClick: !isExecuting ? handleInsert : undefined,
      inputProps: {
        type: "number",
        value: insertValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInsertValue(parseInt(e.target.value) || 0),
        onClick: (e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation(),
        min: 1,
        max: 100,
        disabled: isExecuting,
      },
      disabled: isExecuting,
    },
    {
      label: "Search",
      icon: <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />,
      onClick: !isExecuting ? handleSearch : undefined,
      inputProps: {
        type: "number",
        value: searchValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(parseInt(e.target.value) || 0),
        onClick: (e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation(),
        min: 1,
        max: 100,
        disabled: isExecuting,
      },
      disabled: isExecuting,
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />,
      onClick: !isExecuting ? handleDelete : undefined,
      inputProps: {
        type: "number",
        value: deleteValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDeleteValue(parseInt(e.target.value) || 0),
        onClick: (e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation(),
        min: 1,
        max: 100,
        disabled: isExecuting,
      },
      disabled: isExecuting,
    },
    {
      label: "Find Minimum",
      icon: <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />,
      onClick: !isExecuting ? handleFindMin : undefined,
      disabled: isExecuting,
      group: "minmax",
    },
    {
      label: "Find Maximum",
      icon: <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />,
      onClick: !isExecuting ? handleFindMax : undefined,
      disabled: isExecuting,
      group: "minmax",
    },
  ];

  return (
    <OperationMenu
      items={items}
      triggerIcon={<Menu size={24} />}
      triggerBgColor="bg-gray-500 hover:bg-gray-600 text-white"
      position={{ position: "absolute", top: 24, left: 24, zIndex: 30 }}
    />
  );
}
