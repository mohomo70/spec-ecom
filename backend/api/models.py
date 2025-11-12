"""
Models for freshwater fish ecommerce platform.
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.utils import timezone


class User(AbstractUser):
    """Custom user model extending Django's AbstractUser."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    role = models.CharField(
        max_length=10,
        choices=[
            ('user', 'User'),
            ('admin', 'Admin'),
        ],
        default='user'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='api_user_set',
        related_query_name='api_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='api_user_set',
        related_query_name='api_user',
    )

    class Meta:
        db_table = 'users'


class UserProfile(models.Model):
    """Extended user information and preferences."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    experience_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced')
        ],
        default='beginner'
    )
    preferred_tank_size = models.IntegerField(null=True, blank=True, help_text="Gallons")
    newsletter_subscribed = models.BooleanField(default=False)
    marketing_emails = models.BooleanField(default=False)

    class Meta:
        db_table = 'user_profiles'


class Category(models.Model):
    """Product categories for organizing fish."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    parent_category = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name


class FishProduct(models.Model):
    """Individual fish species/varieties available for sale."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    species_name = models.CharField(max_length=100)
    scientific_name = models.CharField(max_length=150, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_available = models.BooleanField(default=True)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced')
        ]
    )
    min_tank_size_gallons = models.IntegerField(validators=[MinValueValidator(1)])
    ph_range_min = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(14)])
    ph_range_max = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(14)])
    temperature_range_min = models.IntegerField(null=True, blank=True)
    temperature_range_max = models.IntegerField(null=True, blank=True)
    max_size_inches = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    lifespan_years = models.IntegerField(null=True, blank=True)
    diet_type = models.CharField(
        max_length=20,
        choices=[
            ('herbivore', 'Herbivore'),
            ('carnivore', 'Carnivore'),
            ('omnivore', 'Omnivore')
        ],
        null=True,
        blank=True
    )
    compatibility_notes = models.TextField(blank=True)
    care_instructions = models.TextField()
    image_url = models.URLField(blank=True)
    additional_images = models.JSONField(default=list, blank=True)
    seo_title = models.CharField(max_length=60, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    categories = models.ManyToManyField(Category, related_name='products', blank=True)

    class Meta:
        db_table = 'fish_products'
        ordering = ['species_name']

    def __str__(self):
        return f"{self.species_name} ({self.scientific_name or 'Unknown'})"


class ShippingAddress(models.Model):
    """Customer shipping and billing addresses."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(
        max_length=10,
        choices=[
            ('shipping', 'Shipping'),
            ('billing', 'Billing')
        ]
    )
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    company = models.CharField(max_length=50, blank=True)
    address_line_1 = models.CharField(max_length=100)
    address_line_2 = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=2, default='US')
    phone = models.CharField(max_length=15, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shipping_addresses'
        unique_together = ['user', 'address_type', 'is_default']


class Order(models.Model):
    """Purchase transaction records."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('processing', 'Processing'),
            ('shipped', 'Shipped'),
            ('delivered', 'Delivered'),
            ('cancelled', 'Cancelled')
        ],
        default='pending'
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('paid', 'Paid'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded')
        ],
        default='pending'
    )
    payment_method = models.CharField(max_length=50, blank=True)
    shipping_address = models.ForeignKey(ShippingAddress, on_delete=models.PROTECT, related_name='shipping_orders')
    billing_address = models.ForeignKey(ShippingAddress, on_delete=models.PROTECT, null=True, blank=True, related_name='billing_orders')
    order_notes = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=50, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number: FW{YYYY}{MM}{DD}{XXXX}
            from django.utils import timezone
            now = timezone.now()
            date_part = now.strftime('%Y%m%d')
            # Find next sequence number for today
            today_orders = Order.objects.filter(
                order_number__startswith=f'FW{date_part}'
            ).count()
            sequence = str(today_orders + 1).zfill(4)
            self.order_number = f'FW{date_part}{sequence}'
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Individual items within an order."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(FishProduct, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_snapshot = models.JSONField(help_text="Product data at time of order")

    class Meta:
        db_table = 'order_items'
        unique_together = ['order', 'product']


class ArticleCategory(models.Model):
    """Article categories for organizing blog articles."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'article_categories'
        ordering = ['name']
        verbose_name_plural = 'Article Categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            original_slug = self.slug
            counter = 1
            while ArticleCategory.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)


class Article(models.Model):
    """Blog articles with rich text content and SEO metadata."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    featured_image_url = models.URLField(blank=True)
    featured_image_alt_text = models.CharField(max_length=200, blank=True)
    category = models.ForeignKey(ArticleCategory, on_delete=models.RESTRICT, related_name='articles')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'articles'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['published_at']),
            models.Index(fields=['created_at']),
            models.Index(fields=['status', 'published_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            original_slug = self.slug
            counter = 1
            while Article.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1

        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        elif self.status == 'draft' and self.published_at:
            self.published_at = None

        super().save(*args, **kwargs)
