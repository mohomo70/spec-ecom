"""
Cart views.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import FishProduct
from ..serializers import FishProductSerializer


class CartView(APIView):
    """Cart management endpoint."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current cart contents."""
        # For now, return empty cart - cart persistence will be implemented later
        return Response({
            'items': [],
            'total': 0,
            'item_count': 0
        })

    def post(self, request):
        """Add item to cart."""
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            product = get_object_or_404(FishProduct, id=product_id, is_available=True)
            if product.stock_quantity < quantity:
                return Response(
                    {'error': 'Insufficient stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # For now, just return success - cart persistence will be implemented later
            return Response({
                'message': 'Item added to cart',
                'product': FishProductSerializer(product).data,
                'quantity': quantity
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def put(self, request):
        """Update cart item."""
        # Placeholder for cart update functionality
        return Response({'message': 'Cart update not yet implemented'})

    def delete(self, request):
        """Remove item from cart or clear cart."""
        # Placeholder for cart removal functionality
        return Response({'message': 'Cart removal not yet implemented'})