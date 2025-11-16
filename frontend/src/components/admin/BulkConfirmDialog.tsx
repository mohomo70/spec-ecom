"use client";

import { Button } from "@/components/ui/button";

interface BulkConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BulkConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: BulkConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              {cancelLabel}
            </Button>
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "Processing..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

