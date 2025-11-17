"use client";

import { Button } from "@/components/ui/button";

interface ConflictWarningProps {
  message: string;
  currentUpdatedAt?: string;
  onRetry?: () => void;
  onForceUpdate?: () => void;
}

export default function ConflictWarning({
  message,
  currentUpdatedAt,
  onRetry,
  onForceUpdate,
}: ConflictWarningProps) {
  return (
    <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Conflict Detected
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{message}</p>
            {currentUpdatedAt && (
              <p className="mt-1 text-xs">
                Last updated: {new Date(currentUpdatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="mt-4 flex space-x-3">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="bg-white text-yellow-800 border-yellow-300 hover:bg-yellow-50"
              >
                Reload & Retry
              </Button>
            )}
            {onForceUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onForceUpdate}
                className="bg-white text-yellow-800 border-yellow-300 hover:bg-yellow-50"
              >
                Force Update Anyway
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

