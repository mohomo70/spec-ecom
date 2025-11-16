"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { adminApi, UserFormData } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import UserForm from "@/components/admin/UserForm";
import UserProfileView from "@/components/admin/UserProfileView";
import SuccessMessage from "@/components/admin/SuccessMessage";
import ErrorMessage from "@/components/admin/ErrorMessage";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = resolvedParams.id;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: async () => {
      const response = await adminApi.getUser(userId);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: UserFormData) => {
      await adminApi.updateUser(userId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSuccessMessage("User updated successfully!");
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading user..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update user information. Role changes must be done through Django admin.
          </p>
        </div>
      </div>

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {updateMutation.isError && (
        <ErrorMessage
          message={
            updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "Failed to update user. Please try again."
          }
          onRetry={() => updateMutation.reset()}
          onDismiss={() => updateMutation.reset()}
        />
      )}

      <div className="flex items-center justify-end mb-4">
        <Link href="/admin/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            user={data}
            onSubmit={async (formData) => {
              await updateMutation.mutateAsync(formData);
            }}
            onCancel={() => router.push("/admin/users")}
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileView userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}

