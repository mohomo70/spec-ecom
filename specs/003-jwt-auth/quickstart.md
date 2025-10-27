# Quickstart: JWT Authentication System

**Feature**: 003-jwt-auth | **Setup Time**: ~45 minutes (backend + frontend)

## Prerequisites

### Backend
- Python 3.11+
- Django 4.2+
- PostgreSQL database
- Virtual environment activated

### Frontend
- Node.js 18+
- npm or yarn
- Next.js 15 project initialized

## Installation

### 1. Install Dependencies

```bash
pip install djangorestframework-simplejwt
```

### 2. Update Django Settings

Add to `settings.py`:

```python
INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
    'rest_framework_simplejwt',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'ALGORITHM': 'HS256',
}
```

### 3. Update User Model

Create `backend/api/models.py`:

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
```

Update `settings.py`:

```python
AUTH_USER_MODEL = 'api.User'
```

### 4. Create Migration

```bash
python manage.py makemigrations api
python manage.py migrate
```

### 5. Create Serializers

Create `backend/api/serializers.py`:

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('email', 'password', 'first_name')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            role='user'
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'first_name', 'role', 'date_joined')
```

### 6. Create Views

Create `backend/api/views.py`:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from .serializers import UserRegistrationSerializer, UserProfileSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, 
                       status=status.HTTP_401_UNAUTHORIZED)
    
    if not user.check_password(password):
        return Response({'error': 'Invalid credentials'}, 
                       status=status.HTTP_401_UNAUTHORIZED)
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'user': UserProfileSerializer(user).data
    })

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    if request.method == 'PATCH':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 7. Create URL Routes

Update `backend/api/urls.py`:

```python
from django.urls import path
from .views import register, login, profile

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/profile/', profile, name='profile'),
]
```

Update main `urls.py`:

```python
urlpatterns = [
    # ... existing patterns
    path('api/', include('api.urls')),
]
```

### 8. Run Backend Server

```bash
python manage.py runserver
```

## Backend Testing Endpoints

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "mypassword123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "mypassword123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Profile
```bash
curl -X PATCH http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe"}'
```

---

# Frontend Setup

## Install Frontend Dependencies

```bash
npm install react-hook-form zod @hookform/resolvers axios zustand
npm install -D @types/zod
```

## Create Auth Service (`frontend/src/lib/auth.ts`)

### Create Auth Service (`frontend/src/lib/auth.ts`)

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const authService = {
  register: async (email: string, password: string, name: string) => {
    const response = await axios.post(`${API_URL}/auth/register/`, {
      email,
      password,
      name
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login/`, {
      email,
      password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/auth/profile/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  }
};

// Configure Axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Create Auth Store (`frontend/src/lib/store/auth.ts`)

```typescript
import { create } from 'zustand';

interface User {
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## Create Auth Pages

### Register Page (`frontend/src/app/(auth)/register/page.tsx`)

See full implementation in `frontend/src/app/(auth)/register/page.tsx`

### Login Page (`frontend/src/app/(auth)/login/page.tsx`)

See full implementation in `frontend/src/app/(auth)/login/page.tsx`

### Profile Page (`frontend/src/app/profile/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import apiClient from '@/lib/auth';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/profile/');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [setUser]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div className="container mx-auto p-6">
      <h1>Profile</h1>
      <p>Email: {user.email}</p>
      <p>Name: {user.name}</p>
      <p>Role: {user.role}</p>
      <button onClick={() => { logout(); authService.logout(); }}>
        Logout
      </button>
    </div>
  );
}
```

## Run Frontend

```bash
npm run dev
```

Frontend will be available at http://localhost:3000

---

## Complete Verification Checklist

### Backend
- [ ] Dependencies installed
- [ ] Settings configured
- [ ] User model created and migrated
- [ ] Serializers working
- [ ] Views created
- [ ] URLs configured
- [ ] API endpoints responding
- [ ] JWT tokens generated on register/login
- [ ] Profile endpoint requires authentication
- [ ] Token validation working

### Frontend
- [ ] Frontend dependencies installed
- [ ] Auth service created
- [ ] Axios interceptors configured
- [ ] Auth store implemented
- [ ] Register page working
- [ ] Login page working
- [ ] Profile page displays user info
- [ ] Token stored in localStorage
- [ ] Auto-redirect on 401 works

## Common Issues

### Backend Issues

**Migration errors**: Run `python manage.py makemigrations` and `migrate` again

**Circular import**: Ensure AUTH_USER_MODEL is set in settings before importing User model

**Token validation fails**: Check that SIMPLE_JWT settings are configured correctly

**CORS errors**: Add frontend URL to CORS_ALLOWED_ORIGINS in settings

### Frontend Issues

**TypeScript errors**: Install @types/zod and ensure types are correct

**Token not persisting**: Check localStorage is enabled in browser

**Redirect loop**: Ensure token validation logic is working on backend

**Axios interceptor not working**: Verify interceptor setup in auth.ts

