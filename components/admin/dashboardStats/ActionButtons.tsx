"use client";

import {
  HiOutlineRefresh,
  HiOutlineUserGroup,
  HiOutlineChartBar,
} from "react-icons/hi";

interface ActionButtonsProps {
  syncing: boolean;
  assigning: boolean;
  onSync: () => void;
  onAssign: () => void;
  onSetTarget: () => void;
  currentTarget: number | null;
}

export function ActionButtons({
  syncing,
  assigning,
  onSync,
  onAssign,
  onSetTarget,
  currentTarget,
}: ActionButtonsProps) {
  return (
    <>
      <button
        className="px-3 cursor-pointer sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
        onClick={onSync}
        disabled={syncing || assigning}
      >
        {syncing ? (
          <HiOutlineRefresh className="h-4 w-4 animate-spin" />
        ) : (
          <HiOutlineRefresh className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync Now"}</span>
        <span className="sm:hidden">{syncing ? "Syncing..." : "Sync"}</span>
      </button>
      <button
        className="px-3 cursor-pointer sm:px-4 py-2 bg-secondary text-secondary-foreground rounded-lg shadow-sm hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
        onClick={onAssign}
        disabled={syncing || assigning}
      >
        {assigning ? (
          <HiOutlineRefresh className="h-4 w-4 animate-spin" />
        ) : (
          <HiOutlineUserGroup className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {assigning ? "Assigning..." : "Assign All Souls"}
        </span>
        <span className="sm:hidden">{assigning ? "Assigning..." : "Assign"}</span>
      </button>
      <button
        className="px-3 cursor-pointer sm:px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
        onClick={onSetTarget}
      >
        <HiOutlineChartBar className="h-4 w-4" />
        <span className="hidden sm:inline">
          {currentTarget && currentTarget > 0 ? "Update Target" : "Set Target"}
        </span>
        <span className="sm:hidden">{currentTarget && currentTarget > 0 ? "Update" : "Target"}</span>
      </button>
    </>
  );
}
