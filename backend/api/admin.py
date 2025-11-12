from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, UserProfile, Category, FishProduct, ShippingAddress, Order, OrderItem,
    ArticleCategory, Article, ProductImage, CategoryImage, ArticleImage
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin for User model."""
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin for UserProfile model."""
    list_display = ['user', 'experience_level', 'preferred_tank_size', 'newsletter_subscribed']
    list_filter = ['experience_level', 'newsletter_subscribed', 'marketing_emails']
    search_fields = ['user__username', 'user__email']


# Inline admin classes (must be defined before use)
class ProductImageInline(admin.TabularInline):
    """Inline admin for ProductImage."""
    model = ProductImage
    extra = 1
    fields = ['image', 'is_primary', 'display_order', 'alt_text', 'caption']


class CategoryImageInline(admin.TabularInline):
    """Inline admin for CategoryImage."""
    model = CategoryImage
    extra = 1
    fields = ['image', 'alt_text']


class ArticleImageInline(admin.TabularInline):
    """Inline admin for ArticleImage."""
    model = ArticleImage
    extra = 1
    fields = ['image', 'alt_text']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin for Category model."""
    list_display = ['name', 'slug', 'parent_category', 'display_order', 'is_active']
    list_filter = ['is_active', 'parent_category']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'name']
    inlines = [CategoryImageInline]


@admin.register(FishProduct)
class FishProductAdmin(admin.ModelAdmin):
    """Admin for FishProduct model."""
    list_display = ['species_name', 'scientific_name', 'price', 'stock_quantity', 'is_available', 'difficulty_level']
    list_filter = ['is_available', 'difficulty_level', 'diet_type', 'categories']
    search_fields = ['species_name', 'scientific_name', 'description']
    filter_horizontal = ['categories']
    ordering = ['species_name']
    inlines = [ProductImageInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('species_name', 'scientific_name', 'description', 'categories')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'stock_quantity', 'is_available')
        }),
        ('Fish Care Details', {
            'fields': ('difficulty_level', 'min_tank_size_gallons', 'ph_range_min', 'ph_range_max',
                      'temperature_range_min', 'temperature_range_max', 'max_size_inches',
                      'lifespan_years', 'diet_type', 'compatibility_notes', 'care_instructions')
        }),
        ('Media & SEO', {
            'fields': ('image_url', 'additional_images', 'seo_title', 'seo_description'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    """Admin for ShippingAddress model."""
    list_display = ['user', 'address_type', 'first_name', 'last_name', 'city', 'state', 'is_default']
    list_filter = ['address_type', 'is_default', 'country']
    search_fields = ['user__username', 'user__email', 'first_name', 'last_name', 'city', 'state']
    ordering = ['user', 'address_type']


class OrderItemInline(admin.TabularInline):
    """Inline admin for OrderItem."""
    model = OrderItem
    readonly_fields = ['product', 'quantity', 'unit_price', 'total_price']
    can_delete = False
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin for Order model."""
    list_display = ['order_number', 'user', 'status', 'total_amount', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'user__username', 'user__email']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    ordering = ['-created_at']

    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'created_at', 'updated_at')
        }),
        ('Financial Details', {
            'fields': ('total_amount', 'shipping_amount', 'tax_amount', 'discount_amount', 'payment_status', 'payment_method')
        }),
        ('Shipping & Billing', {
            'fields': ('shipping_address', 'billing_address', 'tracking_number', 'estimated_delivery')
        }),
        ('Additional Information', {
            'fields': ('order_notes',),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin for OrderItem model."""
    list_display = ['order', 'product', 'quantity', 'unit_price', 'total_price']
    list_filter = ['order__status', 'order__created_at']
    search_fields = ['order__order_number', 'product__species_name']
    readonly_fields = ['order', 'product', 'quantity', 'unit_price', 'total_price', 'product_snapshot']
    ordering = ['order', 'product']


@admin.register(ArticleCategory)
class ArticleCategoryAdmin(admin.ModelAdmin):
    """Admin for ArticleCategory model."""
    list_display = ['name', 'slug', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    """Admin for Article model."""
    list_display = ['title', 'slug', 'category', 'author', 'status', 'published_at', 'created_at']
    list_filter = ['status', 'category', 'published_at', 'created_at']
    search_fields = ['title', 'slug', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'published_at']
    ordering = ['-published_at', '-created_at']
    inlines = [ArticleImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'category', 'author', 'status')
        }),
        ('Content', {
            'fields': ('excerpt', 'content')
        }),
        ('Media & SEO', {
            'fields': ('featured_image_url', 'featured_image_alt_text', 'meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Auto-set author if not set."""
        if not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin for ProductImage model."""
    list_display = ['product', 'is_primary', 'display_order', 'alt_text', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__species_name', 'alt_text', 'caption']
    ordering = ['product', '-is_primary', 'display_order']


@admin.register(CategoryImage)
class CategoryImageAdmin(admin.ModelAdmin):
    """Admin for CategoryImage model."""
    list_display = ['category', 'alt_text', 'created_at']
    list_filter = ['created_at']
    search_fields = ['category__name', 'alt_text']
    ordering = ['category', 'created_at']


@admin.register(ArticleImage)
class ArticleImageAdmin(admin.ModelAdmin):
    """Admin for ArticleImage model."""
    list_display = ['article', 'alt_text', 'created_at']
    list_filter = ['created_at']
    search_fields = ['article__title', 'alt_text']
    ordering = ['article', 'created_at']
