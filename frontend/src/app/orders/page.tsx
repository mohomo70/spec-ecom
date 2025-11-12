"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: string;
  created_at: string;
  items: Array<{
    id: string;
    product: {
      species_name: string;
      scientific_name?: string;
      image_url?: string; // Legacy field
      primary_image_url?: string; // New uploaded primary image
      images?: Array<{
        id: string;
        url: string;
        is_primary: boolean;
      }>;
    };
    quantity: number;
    unit_price: string;
    total_price: string;
  }>;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
            <p className="text-muted-foreground mb-4">
              There was a problem loading your orders. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ordersList = (orders as any)?.results || [];

  if (ordersList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-4">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {ordersList.map((order: Order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.order_number}
                  </CardTitle>
                  <CardDescription>
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-2xl font-bold mt-2">${order.total_amount}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items Ordered:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {(() => {
                              const imageUrl = item.product.primary_image_url || 
                                               item.product.images?.find(img => img.is_primary)?.url ||
                                               item.product.images?.[0]?.url ||
                                               item.product.image_url;
                              return imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.product.species_name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="text-xs text-gray-400">No Image</div>
                              );
                            })()}
                          </div>
                          <div>
                            <p className="font-medium">{item.product.species_name}</p>
                            {item.product.scientific_name && (
                              <p className="text-sm text-muted-foreground italic">
                                {item.product.scientific_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.unit_price}
                          </p>
                          <p className="font-medium">${item.total_price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline">
                      View Details
                    </Button>
                  </Link>
                  {order.status === 'delivered' && (
                    <Button variant="outline">
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}