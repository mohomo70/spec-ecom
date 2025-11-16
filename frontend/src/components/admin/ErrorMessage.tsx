"use client";

import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorMessage({
  message,
  onRetry,
  onDismiss,
}: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-red-50 p-4 border border-red-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          <div className="mt-4 flex space-x-3">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="bg-white text-red-800 border-red-300 hover:bg-red-50"
              >
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDismiss}
                className="bg-white text-red-800 border-red-300 hover:bg-red-50"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

