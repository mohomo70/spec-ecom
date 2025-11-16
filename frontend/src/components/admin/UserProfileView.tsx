"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, UserProfile } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import LoadingIndicator from "@/components/admin/LoadingIndicator";

interface UserProfileViewProps {
  userId: string;
}

export default function UserProfileView({ userId }: UserProfileViewProps) {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin", "users", userId, "profile"],
    queryFn: async () => {
      const response = await adminApi.getUserProfile(userId);
      return response.data as UserProfile;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      await adminApi.updateUserProfile(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId, "profile"] });
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No profile information available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Experience Level</dt>
          <dd className="mt-1 text-sm text-gray-900 capitalize">
            {profile.experience_level || "Not set"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Preferred Tank Size</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {profile.preferred_tank_size ? `${profile.preferred_tank_size} gallons` : "Not set"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Newsletter Subscribed</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {profile.newsletter_subscribed ? "Yes" : "No"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Marketing Emails</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {profile.marketing_emails ? "Enabled" : "Disabled"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

