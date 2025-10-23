from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile, Category, FishProduct, ShippingAddress, Order, OrderItem


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


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin for Category model."""
    list_display = ['name', 'slug', 'parent_category', 'display_order', 'is_active']
    list_filter = ['is_active', 'parent_category']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'name']


@admin.register(FishProduct)
class FishProductAdmin(admin.ModelAdmin):
    """Admin for FishProduct model."""
    list_display = ['species_name', 'scientific_name', 'price', 'stock_quantity', 'is_available', 'difficulty_level']
    list_filter = ['is_available', 'difficulty_level', 'diet_type', 'categories']
    search_fields = ['species_name', 'scientific_name', 'description']
    filter_horizontal = ['categories']
    ordering = ['species_name']

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
