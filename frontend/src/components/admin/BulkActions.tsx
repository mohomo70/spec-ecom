"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import BulkConfirmDialog from "@/components/admin/BulkConfirmDialog";

interface BulkActionsProps {
  selectedIds: string[];
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onBulkStatusChange?: (ids: string[], statusField: string, statusValue: any) => Promise<void>;
  statusOptions?: Array<{ value: any; label: string }>;
  statusField?: string;
  entityName?: string;
}

export default function BulkActions({
  selectedIds,
  onBulkDelete,
  onBulkStatusChange,
  statusOptions = [],
  statusField = "is_active",
  entityName = "items",
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  const handleDelete = async () => {
    if (!onBulkDelete) return;
    setIsLoading(true);
    try {
      await onBulkDelete(selectedIds);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!onBulkStatusChange || selectedStatus === null) return;
    setIsLoading(true);
    try {
      await onBulkStatusChange(selectedIds, statusField, selectedStatus);
      setShowStatusDialog(false);
      setSelectedStatus(null);
    } catch (error) {
      console.error("Bulk status change error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.length} {entityName} selected
            </span>
            {onBulkStatusChange && statusOptions.length > 0 && (
              <div className="flex items-center space-x-2">
                <select
                  value={selectedStatus || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setSelectedStatus(value);
                      setShowStatusDialog(true);
                    }
                  }}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">Change status...</option>
                  {statusOptions.map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onBulkDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete Selected
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("clearBulkSelection"));
                }
              }}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </div>

      <BulkConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Selected Items"
        message={`Are you sure you want to delete ${selectedIds.length} selected ${entityName}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={isLoading}
      />

      {selectedStatus !== null && (
        <BulkConfirmDialog
          isOpen={showStatusDialog}
          title="Change Status"
          message={`Are you sure you want to change the status of ${selectedIds.length} selected ${entityName}?`}
          confirmLabel="Change Status"
          onConfirm={handleStatusChange}
          onCancel={() => {
            setShowStatusDialog(false);
            setSelectedStatus(null);
          }}
          isLoading={isLoading}
        />
      )}
    </>
  );
}

