"""
Serializers for freshwater fish ecommerce platform.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.html import strip_tags
import bleach
from .models import UserProfile, Category, FishProduct, ShippingAddress, Order, OrderItem, ArticleCategory, Article

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'date_joined', 'is_active']
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
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data.get('email', validated_data.get('username')),
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='user'
        )
        user.set_password(password)
        user.save()
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


class ArticleCategorySerializer(serializers.ModelSerializer):
    """Serializer for ArticleCategory model."""

    class Meta:
        model = ArticleCategory
        fields = ['id', 'name', 'slug', 'description', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class ArticleSummarySerializer(serializers.ModelSerializer):
    """Serializer for article listing (summary view)."""
    category = ArticleCategorySerializer(read_only=True)
    author = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image_url', 'featured_image_alt_text',
            'category', 'author', 'published_at', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'published_at']

    def get_author(self, obj):
        return {
            'id': str(obj.author.id),
            'first_name': obj.author.first_name,
            'email': obj.author.email
        }

    def get_excerpt(self, obj):
        if obj.excerpt:
            return obj.excerpt
        content = strip_tags(obj.content)
        if len(content) > 200:
            return content[:200].rstrip() + '...'
        return content


class ArticleDetailSerializer(ArticleSummarySerializer):
    """Serializer for article detail view."""

    class Meta(ArticleSummarySerializer.Meta):
        fields = ArticleSummarySerializer.Meta.fields + [
            'content', 'meta_title', 'meta_description', 'status', 'updated_at'
        ]
        read_only_fields = ArticleSummarySerializer.Meta.read_only_fields + ['updated_at']


class ArticleCategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating article categories."""

    class Meta:
        model = ArticleCategory
        fields = ['name', 'description']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True}
        }

    def validate_name(self, value):
        if ArticleCategory.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A category with this name already exists.")
        return value


class ArticleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating articles."""
    category_id = serializers.UUIDField(write_only=True)
    category = ArticleCategorySerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            'title', 'content', 'excerpt', 'featured_image_url', 'featured_image_alt_text',
            'category_id', 'category', 'status', 'meta_title', 'meta_description'
        ]
        extra_kwargs = {
            'excerpt': {'required': False, 'allow_blank': True},
            'featured_image_url': {'required': False, 'allow_blank': True},
            'featured_image_alt_text': {'required': False, 'allow_blank': True},
            'meta_title': {'required': False, 'allow_blank': True},
            'meta_description': {'required': False, 'allow_blank': True},
        }

    def validate_content(self, value):
        """Sanitize HTML content to prevent XSS attacks."""
        allowed_tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 
                       'strong', 'em', 'a', 'img', 'blockquote', 'br']
        allowed_attributes = {
            'a': ['href', 'title'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
        }
        return bleach.clean(value, tags=allowed_tags, attributes=allowed_attributes, strip=True)

    def validate(self, attrs):
        """Validate featured_image_alt_text is provided when featured_image_url is provided."""
        featured_image_url = attrs.get('featured_image_url')
        featured_image_alt_text = attrs.get('featured_image_alt_text')
        
        if featured_image_url and not featured_image_alt_text:
            raise serializers.ValidationError({
                'featured_image_alt_text': 'Alt text is required when a featured image is provided.'
            })
        return attrs

    def create(self, validated_data):
        """Create article with author assignment and default meta fields."""
        category_id = validated_data.pop('category_id')
        try:
            category = ArticleCategory.objects.get(id=category_id)
        except ArticleCategory.DoesNotExist:
            raise serializers.ValidationError({
                'category_id': f'Category with id {category_id} does not exist.'
            })
        
        # Set author from request user
        validated_data['author'] = self.context['request'].user
        validated_data['category'] = category
        
        # Generate default meta title if not provided
        if not validated_data.get('meta_title'):
            validated_data['meta_title'] = validated_data['title']
        
        # Generate default meta description if not provided
        if not validated_data.get('meta_description'):
            content = strip_tags(validated_data['content'])
            validated_data['meta_description'] = content[:160].rstrip() + '...' if len(content) > 160 else content
        
        try:
            return Article.objects.create(**validated_data)
        except Exception as e:
            raise serializers.ValidationError({
                'non_field_errors': [f'Failed to create article: {str(e)}']
            })

    def update(self, instance, validated_data):
        """Update article with default meta generation if needed."""
        category_id = validated_data.pop('category_id', None)
        if category_id:
            try:
                instance.category = ArticleCategory.objects.get(id=category_id)
            except ArticleCategory.DoesNotExist:
                raise serializers.ValidationError({
                    'category_id': f'Category with id {category_id} does not exist.'
                })
        
        # Generate default meta title if not provided and title changed
        if not validated_data.get('meta_title') and 'title' in validated_data:
            validated_data['meta_title'] = validated_data['title']
        
        # Generate default meta description if not provided and content changed
        if not validated_data.get('meta_description') and 'content' in validated_data:
            content = strip_tags(validated_data['content'])
            validated_data['meta_description'] = content[:160].rstrip() + '...' if len(content) > 160 else content
        
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
        except Exception as e:
            raise serializers.ValidationError({
                'non_field_errors': [f'Failed to update article: {str(e)}']
            })