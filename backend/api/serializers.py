"""
Serializers for freshwater fish ecommerce platform.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, Category, FishProduct, ShippingAddress, Order, OrderItem

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined', 'is_active']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""

    class Meta:
        model = UserProfile
        fields = ['experience_level', 'preferred_tank_size', 'newsletter_subscribed', 'marketing_emails']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'parent_category', 'display_order', 'is_active']
        read_only_fields = ['id']


class FishProductSerializer(serializers.ModelSerializer):
    """Serializer for FishProduct model."""

    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = FishProduct
        fields = [
            'id', 'species_name', 'scientific_name', 'description', 'price', 'stock_quantity',
            'is_available', 'difficulty_level', 'min_tank_size_gallons', 'ph_range_min',
            'ph_range_max', 'temperature_range_min', 'temperature_range_max', 'max_size_inches',
            'lifespan_years', 'diet_type', 'compatibility_notes', 'care_instructions',
            'image_url', 'additional_images', 'seo_title', 'seo_description', 'categories',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShippingAddressSerializer(serializers.ModelSerializer):
    """Serializer for ShippingAddress model."""

    class Meta:
        model = ShippingAddress
        fields = [
            'id', 'address_type', 'first_name', 'last_name', 'company', 'address_line_1',
            'address_line_2', 'city', 'state', 'postal_code', 'country', 'phone', 'is_default',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model."""

    product = FishProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'unit_price', 'total_price', 'product_snapshot']
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model."""

    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = ShippingAddressSerializer(read_only=True)
    billing_address = ShippingAddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'total_amount', 'shipping_amount', 'tax_amount',
            'discount_amount', 'payment_status', 'payment_method', 'shipping_address',
            'billing_address', 'order_notes', 'tracking_number', 'estimated_delivery',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders."""

    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    shipping_address_id = serializers.UUIDField(write_only=True)
    billing_address_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            'items', 'shipping_address_id', 'billing_address_id', 'order_notes',
            'payment_method'
        ]

    def validate(self, attrs):
        user = self.context['request'].user

        # Validate addresses belong to user
        shipping_address = ShippingAddress.objects.filter(
            id=attrs['shipping_address_id'],
            user=user,
            address_type='shipping'
        ).first()
        if not shipping_address:
            raise serializers.ValidationError("Invalid shipping address")

        if 'billing_address_id' in attrs:
            billing_address = ShippingAddress.objects.filter(
                id=attrs['billing_address_id'],
                user=user,
                address_type='billing'
            ).first()
            if not billing_address:
                raise serializers.ValidationError("Invalid billing address")

        # Validate items
        if not attrs['items']:
            raise serializers.ValidationError("Order must contain at least one item")

        total_amount = 0
        for item_data in attrs['items']:
            try:
                product_id = item_data['product_id']
                quantity = int(item_data['quantity'])

                product = FishProduct.objects.get(id=product_id, is_available=True)
                if product.stock_quantity < quantity:
                    raise serializers.ValidationError(f"Insufficient stock for {product.species_name}")

                total_amount += product.price * quantity

            except (KeyError, ValueError, FishProduct.DoesNotExist):
                raise serializers.ValidationError("Invalid product or quantity")

        attrs['total_amount'] = total_amount
        attrs['shipping_address'] = shipping_address
        attrs['billing_address'] = billing_address if 'billing_address_id' in attrs else None

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data.pop('shipping_address_id')
        validated_data.pop('billing_address_id', None)

        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            product = FishProduct.objects.get(id=item_data['product_id'])
            quantity = item_data['quantity']
            unit_price = product.price
            total_price = unit_price * quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price,
                product_snapshot={
                    'species_name': product.species_name,
                    'scientific_name': product.scientific_name,
                    'price': str(product.price),
                    'image_url': product.image_url,
                }
            )

            # Update stock
            product.stock_quantity -= quantity
            product.save()

        return order