"use client";

interface SyncErrorsDisplayProps {
  syncErrors: any[];
}

export function SyncErrorsDisplay({ syncErrors }: SyncErrorsDisplayProps) {
  if (syncErrors.length === 0) return null;

  return (
    <details className="text-xs sm:text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded p-2 max-w-full sm:max-w-xs mt-1">
      <summary className="cursor-pointer">Show Sync Errors ({syncErrors.length})</summary>
      <ul className="list-disc pl-4">
        {syncErrors.map((err, i) => (
          <li key={i} className="break-words">
            {err.reason ? (
              <>{err.reason}{err.data?.phone ? ` (Phone: ${err.data.phone})` : ""}</>
            ) : err.error ? (
              <>{err.error}{err.phone ? ` (Phone: ${err.phone})` : ""}</>
            ) : (
              JSON.stringify(err)
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
