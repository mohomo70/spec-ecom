"""
Admin dashboard serializers.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import UserProfile, FishProduct, Category, ProductImage, CategoryImage, Order, OrderItem, Article, ArticleCategory, ArticleImage

User = get_user_model()


class ImageURLMixin:
    """Mixin for serializers to generate image URLs."""
    
    def get_image_url(self, obj):
        """Return full image URL using Django's .url property."""
        if hasattr(obj, 'image') and obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class UserAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for User model - read-only role field."""
    
    role = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'role', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'role', 'date_joined']


class UserAdminCreateSerializer(serializers.ModelSerializer):
    """Admin serializer for creating users - role assignment restricted."""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'is_active'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data.get('username') or validated_data.get('email'),
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            is_active=validated_data.get('is_active', True),
            role='user'
        )
        user.set_password(password)
        user.save()
        return user


class UserAdminUpdateSerializer(serializers.ModelSerializer):
    """Admin serializer for updating users - role field read-only."""
    
    role = serializers.CharField(read_only=True)
    updated_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone', 
            'is_active', 'role', 'updated_at'
        ]
        read_only_fields = ['role']

    def validate(self, attrs):
        if 'role' in attrs:
            raise serializers.ValidationError({
                "role": "Role cannot be changed through admin dashboard. Use Django admin to change user roles."
            })
        return attrs


class UserProfileAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for UserProfile model."""

    class Meta:
        model = UserProfile
        fields = [
            'experience_level', 'preferred_tank_size',
            'newsletter_subscribed', 'marketing_emails'
        ]


class UserDetailAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for user detail view with profile."""
    
    role = serializers.CharField(read_only=True)
    profile = UserProfileAdminSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'role', 'is_active', 'date_joined', 'profile'
        ]
        read_only_fields = ['id', 'role', 'date_joined']


class ProductImageAdminSerializer(serializers.ModelSerializer, ImageURLMixin):
    """Admin serializer for ProductImage."""
    
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = [
            'id', 'image', 'url', 'is_primary', 'display_order',
            'alt_text', 'caption', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for FishProduct - list view."""
    
    primary_image_url = serializers.SerializerMethodField()
    category_names = serializers.SerializerMethodField()

    class Meta:
        model = FishProduct
        fields = [
            'id', 'species_name', 'scientific_name', 'price', 'stock_quantity',
            'is_available', 'difficulty_level', 'primary_image_url', 'category_names',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_primary_image_url(self, obj):
        primary_image = obj.product_images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None

    def get_category_names(self, obj):
        return [cat.name for cat in obj.categories.all()]


class ProductAdminCreateSerializer(serializers.ModelSerializer):
    """Admin serializer for creating products."""
    
    category_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        allow_empty=True
    )

    class Meta:
        model = FishProduct
        fields = [
            'species_name', 'scientific_name', 'description', 'price', 'stock_quantity',
            'is_available', 'difficulty_level', 'min_tank_size_gallons', 'ph_range_min',
            'ph_range_max', 'temperature_range_min', 'temperature_range_max', 'max_size_inches',
            'lifespan_years', 'diet_type', 'compatibility_notes', 'care_instructions',
            'seo_title', 'seo_description', 'category_ids'
        ]

    def validate(self, attrs):
        ph_min = attrs.get('ph_range_min')
        ph_max = attrs.get('ph_range_max')
        if ph_min is not None and ph_max is not None and ph_min > ph_max:
            raise serializers.ValidationError({
                "ph_range": "ph_range_min must be less than or equal to ph_range_max"
            })
        
        temp_min = attrs.get('temperature_range_min')
        temp_max = attrs.get('temperature_range_max')
        if temp_min is not None and temp_max is not None and temp_min > temp_max:
            raise serializers.ValidationError({
                "temperature_range": "temperature_range_min must be less than or equal to temperature_range_max"
            })
        
        return attrs

    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        product = FishProduct.objects.create(**validated_data)
        if category_ids:
            categories = Category.objects.filter(id__in=category_ids)
            product.categories.set(categories)
        return product


class ProductAdminUpdateSerializer(serializers.ModelSerializer):
    """Admin serializer for updating products."""
    
    category_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    updated_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = FishProduct
        fields = [
            'species_name', 'scientific_name', 'description', 'price', 'stock_quantity',
            'is_available', 'difficulty_level', 'min_tank_size_gallons', 'ph_range_min',
            'ph_range_max', 'temperature_range_min', 'temperature_range_max', 'max_size_inches',
            'lifespan_years', 'diet_type', 'compatibility_notes', 'care_instructions',
            'seo_title', 'seo_description', 'category_ids', 'updated_at'
        ]

    def validate(self, attrs):
        ph_min = attrs.get('ph_range_min')
        ph_max = attrs.get('ph_range_max')
        instance = self.instance
        if ph_min is None and instance:
            ph_min = instance.ph_range_min
        if ph_max is None and instance:
            ph_max = instance.ph_range_max
        if ph_min is not None and ph_max is not None and ph_min > ph_max:
            raise serializers.ValidationError({
                "ph_range": "ph_range_min must be less than or equal to ph_range_max"
            })
        
        temp_min = attrs.get('temperature_range_min')
        temp_max = attrs.get('temperature_range_max')
        if temp_min is None and instance:
            temp_min = instance.temperature_range_min
        if temp_max is None and instance:
            temp_max = instance.temperature_range_max
        if temp_min is not None and temp_max is not None and temp_min > temp_max:
            raise serializers.ValidationError({
                "temperature_range": "temperature_range_min must be less than or equal to temperature_range_max"
            })
        
        return attrs

    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if category_ids is not None:
            categories = Category.objects.filter(id__in=category_ids)
            instance.categories.set(categories)
        return instance


class ProductDetailAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for product detail view with images and categories."""
    
    images = ProductImageAdminSerializer(many=True, read_only=True, source='product_images')
    categories = serializers.SerializerMethodField()
    primary_image_url = serializers.SerializerMethodField()

    class Meta:
        model = FishProduct
        fields = [
            'id', 'species_name', 'scientific_name', 'description', 'price', 'stock_quantity',
            'is_available', 'difficulty_level', 'min_tank_size_gallons', 'ph_range_min',
            'ph_range_max', 'temperature_range_min', 'temperature_range_max', 'max_size_inches',
            'lifespan_years', 'diet_type', 'compatibility_notes', 'care_instructions',
            'image_url', 'primary_image_url', 'images', 'seo_title', 'seo_description',
            'categories', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_categories(self, obj):
        return [{'id': str(cat.id), 'name': cat.name} for cat in obj.categories.all()]

    def get_primary_image_url(self, obj):
        primary_image = obj.product_images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None


class CategoryImageAdminSerializer(serializers.ModelSerializer, ImageURLMixin):
    """Admin serializer for CategoryImage."""
    
    url = serializers.SerializerMethodField()

    class Meta:
        model = CategoryImage
        fields = [
            'id', 'image', 'url', 'alt_text', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CategoryAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for Category - list view."""
    
    parent_name = serializers.CharField(source='parent_category.name', read_only=True)
    product_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'parent_name',
            'parent_category', 'display_order', 'is_active',
            'product_count', 'image_url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_product_count(self, obj):
        return obj.products.count()

    def get_image_url(self, obj):
        category_image = obj.category_images.first()
        if category_image and category_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(category_image.image.url)
            return category_image.image.url
        return None


class CategoryAdminCreateSerializer(serializers.ModelSerializer):
    """Admin serializer for creating categories."""
    
    parent_category = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Category
        fields = [
            'name', 'slug', 'description', 'parent_category',
            'display_order', 'is_active'
        ]

    def validate(self, attrs):
        parent_id = attrs.get('parent_category')
        if parent_id:
            try:
                parent = Category.objects.get(id=parent_id)
            except Category.DoesNotExist:
                raise serializers.ValidationError({
                    "parent_category": "Parent category not found"
                })
        return attrs

    def create(self, validated_data):
        parent_id = validated_data.pop('parent_category', None)
        if parent_id:
            validated_data['parent_category_id'] = parent_id
        return Category.objects.create(**validated_data)


class CategoryAdminUpdateSerializer(serializers.ModelSerializer):
    """Admin serializer for updating categories."""
    
    parent_category = serializers.UUIDField(required=False, allow_null=True)
    updated_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Category
        fields = [
            'name', 'slug', 'description', 'parent_category',
            'display_order', 'is_active', 'updated_at'
        ]

    def validate(self, attrs):
        parent_id = attrs.get('parent_category')
        if parent_id is not None:
            if parent_id == self.instance.id:
                raise serializers.ValidationError({
                    "parent_category": "Category cannot be its own parent"
                })
            try:
                parent = Category.objects.get(id=parent_id)
                if self._check_circular_reference(self.instance, parent):
                    raise serializers.ValidationError({
                        "parent_category": "Circular reference detected. This would create a category hierarchy loop."
                    })
            except Category.DoesNotExist:
                raise serializers.ValidationError({
                    "parent_category": "Parent category not found"
                })
        return attrs

    def _check_circular_reference(self, category, potential_parent):
        """Check if setting potential_parent as parent would create a circular reference."""
        current = potential_parent
        visited = set()
        while current:
            if current.id == category.id:
                return True
            if current.id in visited:
                break
            visited.add(current.id)
            current = current.parent_category
        return False

    def update(self, instance, validated_data):
        parent_id = validated_data.pop('parent_category', None)
        if parent_id is not None:
            validated_data['parent_category_id'] = parent_id
        elif parent_id is None and 'parent_category' in self.initial_data:
            validated_data['parent_category_id'] = None
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class CategoryDetailAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for category detail view with images."""
    
    images = CategoryImageAdminSerializer(many=True, read_only=True, source='category_images')
    parent_category = serializers.SerializerMethodField()
    subcategories = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'parent_category',
            'subcategories', 'display_order', 'is_active',
            'images', 'product_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_parent_category(self, obj):
        if obj.parent_category:
            return {'id': str(obj.parent_category.id), 'name': obj.parent_category.name}
        return None

    def get_subcategories(self, obj):
        return [
            {'id': str(sub.id), 'name': sub.name}
            for sub in obj.subcategories.all()
        ]

    def get_product_count(self, obj):
        return obj.products.count()


class OrderItemAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for OrderItem."""
    
    product_name = serializers.CharField(source='product.species_name', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'quantity',
            'unit_price', 'total_price', 'product_snapshot'
        ]
        read_only_fields = ['id']


class OrderAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for Order - list view."""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user_email', 'user_name',
            'status', 'payment_status', 'total_amount',
            'item_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

    def get_item_count(self, obj):
        return obj.items.count()


class OrderAdminUpdateSerializer(serializers.ModelSerializer):
    """Admin serializer for updating orders."""
    
    updated_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Order
        fields = [
            'status', 'payment_status', 'tracking_number',
            'estimated_delivery', 'order_notes', 'updated_at'
        ]


class OrderDetailAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for order detail view with items."""
    
    user = serializers.SerializerMethodField()
    items = OrderItemAdminSerializer(many=True, read_only=True)
    shipping_address = serializers.SerializerMethodField()
    billing_address = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'status', 'payment_status',
            'payment_method', 'total_amount', 'shipping_amount',
            'tax_amount', 'discount_amount', 'items', 'shipping_address',
            'billing_address', 'tracking_number', 'estimated_delivery',
            'order_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']

    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'email': obj.user.email,
            'name': f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        }

    def get_shipping_address(self, obj):
        if obj.shipping_address:
            addr = obj.shipping_address
            return {
                'street_address': addr.street_address,
                'city': addr.city,
                'state': addr.state,
                'zip_code': addr.zip_code,
                'country': addr.country
            }
        return None

    def get_billing_address(self, obj):
        if obj.billing_address:
            addr = obj.billing_address
            return {
                'street_address': addr.street_address,
                'city': addr.city,
                'state': addr.state,
                'zip_code': addr.zip_code,
                'country': addr.country
            }
        return None


class ArticleImageAdminSerializer(serializers.ModelSerializer, ImageURLMixin):
    """Admin serializer for ArticleImage."""
    
    url = serializers.SerializerMethodField()

    class Meta:
        model = ArticleImage
        fields = [
            'id', 'image', 'url', 'alt_text', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ArticleAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for Article - list view."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'category_name', 'author_name',
            'status', 'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username


class ArticleAdminCreateSerializer(serializers.ModelSerializer):
    """Admin serializer for creating articles."""
    
    category = serializers.UUIDField()

    class Meta:
        model = Article
        fields = [
            'title', 'slug', 'content', 'excerpt', 'category',
            'status', 'meta_title', 'meta_description',
            'featured_image_url', 'featured_image_alt_text'
        ]

    def create(self, validated_data):
        category_id = validated_data.pop('category')
        category = ArticleCategory.objects.get(id=category_id)
        validated_data['category'] = category
        validated_data['author'] = self.context['request'].user
        return Article.objects.create(**validated_data)


class ArticleAdminUpdateSerializer(serializers.ModelSerializer):
    """Admin serializer for updating articles."""
    
    category = serializers.UUIDField(required=False)
    updated_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Article
        fields = [
            'title', 'slug', 'content', 'excerpt', 'category',
            'status', 'meta_title', 'meta_description',
            'featured_image_url', 'featured_image_alt_text', 'updated_at'
        ]

    def update(self, instance, validated_data):
        category_id = validated_data.pop('category', None)
        if category_id:
            category = ArticleCategory.objects.get(id=category_id)
            validated_data['category'] = category
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ArticleDetailAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for article detail view with images."""
    
    images = ArticleImageAdminSerializer(many=True, read_only=True, source='article_images')
    category = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt',
            'category', 'author', 'status', 'meta_title',
            'meta_description', 'featured_image_url',
            'featured_image_alt_text', 'images', 'published_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_category(self, obj):
        return {'id': str(obj.category.id), 'name': obj.category.name}

    def get_author(self, obj):
        return {
            'id': str(obj.author.id),
            'name': f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username,
            'email': obj.author.email
        }
