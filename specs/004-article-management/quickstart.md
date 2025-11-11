# Quickstart Guide: Article Management System

**Feature**: 004-article-management | **Date**: 2025-01-27

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ and npm installed
- PostgreSQL database running
- Redis server running (for caching)
- Existing Django project with User model and JWT authentication

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install bleach django-bleach
```

### 2. Create Models

Add to `backend/api/models.py`:

```python
from django.db import models
from django.utils.text import slugify
import uuid

class ArticleCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'article_categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Article(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True, null=True)
    featured_image_url = models.URLField(blank=True, null=True)
    category = models.ForeignKey(ArticleCategory, on_delete=models.RESTRICT, related_name='articles')
    author = models.ForeignKey('User', on_delete=models.CASCADE, related_name='articles')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    meta_title = models.CharField(max_length=60, blank=True, null=True)
    meta_description = models.CharField(max_length=160, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'articles'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['category']),
            models.Index(fields=['slug']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Article.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
```

### 3. Create Serializers

Add to `backend/api/serializers.py`:

```python
from rest_framework import serializers
from .models import Article, ArticleCategory
import bleach

ALLOWED_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'blockquote', 'br']
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['title']
}

class ArticleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleCategory
        fields = ['id', 'name', 'slug', 'description', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']

class ArticleSummarySerializer(serializers.ModelSerializer):
    category = ArticleCategorySerializer(read_only=True)
    author = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'excerpt', 'featured_image_url', 'category', 'author', 'published_at', 'created_at']
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
        # Auto-generate from content
        from django.utils.html import strip_tags
        text = strip_tags(obj.content)
        return text[:200] + '...' if len(text) > 200 else text

class ArticleDetailSerializer(ArticleSummarySerializer):
    class Meta(ArticleSummarySerializer.Meta):
        fields = ArticleSummarySerializer.Meta.fields + ['content', 'meta_title', 'meta_description', 'status', 'updated_at']

class ArticleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['title', 'content', 'excerpt', 'featured_image_url', 'category', 'status', 'meta_title', 'meta_description']
        extra_kwargs = {
            'category': {'required': True},
            'title': {'required': True},
            'content': {'required': True}
        }

    def validate_content(self, value):
        return bleach.clean(value, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
```

### 4. Create Views

Add to `backend/api/views.py`:

```python
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Article, ArticleCategory
from .serializers import ArticleSummarySerializer, ArticleDetailSerializer, ArticleCreateSerializer, ArticleCategorySerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('category', 'author')
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    ordering_fields = ['published_at', 'created_at']
    ordering = ['-published_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list' and not self.request.user.is_authenticated or self.request.user.role != 'admin':
            queryset = queryset.filter(status='published')
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ArticleCreateSerializer
        elif self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleSummarySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminOrReadOnly()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=['get'], url_path='admin', permission_classes=[permissions.IsAuthenticated, IsAdminOrReadOnly])
    def admin_list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ArticleCategoryViewSet(viewsets.ModelViewSet):
    queryset = ArticleCategory.objects.all()
    serializer_class = ArticleCategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsAdminOrReadOnly()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return ArticleCategory.objects.all()
```

### 5. Add URLs

Add to `backend/api/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, ArticleCategoryViewSet

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'article-categories', ArticleCategoryViewSet, basename='article-category')

urlpatterns = [
    path('', include(router.urls)),
]
```

### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
```

### 2. Create API Client Functions

Add to `frontend/src/lib/api.ts`:

```typescript
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category: ArticleCategory;
  author: { id: string; first_name: string; email: string };
  status: 'draft' | 'published';
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export const articleApi = {
  getArticles: async (params?: { category?: string; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const response = await fetch(`${API_BASE}/articles/?${queryParams}`);
    return response.json();
  },

  getArticle: async (slug: string) => {
    const response = await fetch(`${API_BASE}/articles/${slug}/`);
    return response.json();
  },

  createArticle: async (data: Partial<Article>, token: string) => {
    const response = await fetch(`${API_BASE}/articles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateArticle: async (slug: string, data: Partial<Article>, token: string) => {
    const response = await fetch(`${API_BASE}/articles/${slug}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteArticle: async (slug: string, token: string) => {
    const response = await fetch(`${API_BASE}/articles/${slug}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE}/article-categories/`);
    return response.json();
  },

  createCategory: async (data: { name: string; description?: string }, token: string) => {
    const response = await fetch(`${API_BASE}/article-categories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

### 3. Create Article Pages

Create `frontend/src/app/articles/page.tsx` for listing and `frontend/src/app/articles/[slug]/page.tsx` for detail view.

Create `frontend/src/app/articles/admin/create/page.tsx` and `frontend/src/app/articles/admin/[id]/edit/page.tsx` for admin management.

## Testing

### Backend Tests

```bash
cd backend
python manage.py test api.tests.test_articles
```

### Frontend Tests

```bash
cd frontend
npm test -- articles
```

## Next Steps

1. Implement rich text editor component
2. Add image upload functionality
3. Implement SEO metadata in page headers
4. Add structured data (JSON-LD) to article pages
5. Set up caching for article listings
6. Add search functionality (future enhancement)

