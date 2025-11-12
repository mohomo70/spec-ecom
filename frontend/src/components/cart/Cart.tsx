"use client";

import { useCartStore } from "@/lib/stores/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function Cart() {
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Your cart is empty
          </p>
          <Link href="/products">
            <Button className="w-full">Browse Products</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopping Cart ({itemCount} items)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded">
            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
              {(() => {
                const imageUrl = (item.product as any).primary_image_url || 
                                 (item.product as any).images?.find((img: any) => img.is_primary)?.url ||
                                 (item.product as any).images?.[0]?.url ||
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

            <div className="flex-1">
              <h4 className="font-medium">{item.product.species_name}</h4>
              {item.product.scientific_name && (
                <p className="text-sm text-muted-foreground italic">
                  {item.product.scientific_name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                ${item.unit_price} each
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              >
                -
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              >
                +
              </Button>
            </div>

            <div className="text-right">
              <p className="font-medium">${item.total_price.toFixed(2)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.product.id)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearCart} className="flex-1">
              Clear Cart
            </Button>
            <Link href="/checkout" className="flex-1">
              <Button className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}