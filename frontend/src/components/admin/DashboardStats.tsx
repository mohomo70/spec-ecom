"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import ErrorMessage from "@/components/admin/ErrorMessage";

interface DashboardStats {
  total_products: number;
  available_products: number;
  total_orders: number;
  pending_orders: number;
  total_users: number;
  active_users: number;
  total_categories: number;
  total_articles: number;
  published_articles: number;
  recent_orders_30d: number;
  revenue_30d: number;
}

export default function DashboardStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: async () => {
      const response = await adminApi.getDashboardStats();
      return response.data as DashboardStats;
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading statistics..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Failed to load dashboard statistics. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return null;
  }

  const stats = [
    {
      name: "Total Products",
      value: data.total_products,
      subtitle: `${data.available_products} available`,
      color: "blue",
    },
    {
      name: "Total Orders",
      value: data.total_orders,
      subtitle: `${data.pending_orders} pending`,
      color: "green",
    },
    {
      name: "Total Users",
      value: data.total_users,
      subtitle: `${data.active_users} active`,
      color: "purple",
    },
    {
      name: "Categories",
      value: data.total_categories,
      subtitle: "Active categories",
      color: "yellow",
    },
    {
      name: "Articles",
      value: data.total_articles,
      subtitle: `${data.published_articles} published`,
      color: "indigo",
    },
    {
      name: "Recent Orders (30d)",
      value: data.recent_orders_30d,
      subtitle: "Last 30 days",
      color: "pink",
    },
    {
      name: "Revenue (30d)",
      value: `$${data.revenue_30d.toFixed(2)}`,
      subtitle: "Last 30 days",
      color: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`text-${stat.color}-600`}>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">{stat.subtitle}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

