"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { adminApi, UserFormData } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import UserForm from "@/components/admin/UserForm";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = resolvedParams.id;

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
      router.push("/admin/users");
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
    </div>
  );
}

