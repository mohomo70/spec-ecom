"""
Product views.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.db import transaction, DatabaseError, OperationalError
import os
from ..models import FishProduct, ProductImage
from ..serializers import FishProductSerializer, ProductImageSerializer
from ..validators import validate_image_file
from ..permissions import IsAdminOnly


class ProductListView(generics.ListAPIView):
    """List products with optional search and filtering."""

    serializer_class = FishProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = FishProduct.objects.filter(is_available=True).prefetch_related('categories')

        # Enhanced search functionality
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(species_name__icontains=search) |
                Q(scientific_name__icontains=search) |
                Q(description__icontains=search) |
                Q(care_instructions__icontains=search) |
                Q(compatibility_notes__icontains=search)
            )

        # Category filter
        category = self.request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(categories__slug=category)

        # Difficulty filter
        difficulty = self.request.query_params.get('difficulty', '')
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Tank size filter
        min_tank_size = self.request.query_params.get('min_tank_size')
        if min_tank_size:
            queryset = queryset.filter(min_tank_size_gallons__gte=min_tank_size)

        # pH range filter
        ph_min = self.request.query_params.get('ph_min')
        ph_max = self.request.query_params.get('ph_max')
        if ph_min:
            queryset = queryset.filter(ph_range_min__lte=ph_min, ph_range_max__gte=ph_min)
        if ph_max:
            queryset = queryset.filter(ph_range_min__lte=ph_max, ph_range_max__gte=ph_max)

        # Temperature range filter
        temp_min = self.request.query_params.get('temp_min')
        temp_max = self.request.query_params.get('temp_max')
        if temp_min:
            queryset = queryset.filter(temperature_range_min__lte=temp_min, temperature_range_max__gte=temp_min)
        if temp_max:
            queryset = queryset.filter(temperature_range_min__lte=temp_max, temperature_range_max__gte=temp_max)

        # Diet type filter
        diet_type = self.request.query_params.get('diet_type')
        if diet_type:
            queryset = queryset.filter(diet_type=diet_type)

        # Max size filter
        max_size = self.request.query_params.get('max_size')
        if max_size:
            queryset = queryset.filter(max_size_inches__lte=max_size)

        return queryset.order_by('species_name')


class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve a single product."""

    serializer_class = FishProductSerializer
    permission_classes = [AllowAny]
    queryset = FishProduct.objects.filter(is_available=True).prefetch_related('categories')


class ProductImageUploadView(APIView):
    """Upload, list, update, and delete images for a product."""
    
    permission_classes = [IsAdminOnly]
    
    def get(self, request, product_id):
        """List all images for a product."""
        try:
            product = get_object_or_404(FishProduct, id=product_id)
            images = ProductImage.objects.filter(product=product).order_by('-is_primary', 'display_order', 'created_at')
            serializer = ProductImageSerializer(images, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {
                    'error': 'server_error',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, product_id):
        """Upload one or multiple product images."""
        try:
            product = get_object_or_404(FishProduct, id=product_id)
            
            # Check for multiple images or single image
            images = request.FILES.getlist('images') if 'images' in request.FILES else []
            single_image = request.FILES.get('image')
            
            if not images and not single_image:
                return Response(
                    {
                        'error': 'image_required',
                        'message': 'Image file(s) are required. Use "image" for single upload or "images" for multiple.',
                        'field': 'image'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Normalize to list
            if single_image:
                images = [single_image]
            
            # Check maximum image limit (10 additional images + 1 primary = 11 total max)
            current_image_count = ProductImage.objects.filter(product=product).count()
            max_images = 10  # Maximum additional images (excluding primary)
            
            if current_image_count + len(images) > max_images + 1:  # +1 for potential primary
                return Response(
                    {
                        'error': 'max_images_exceeded',
                        'message': f'Maximum {max_images} additional images allowed per product. Current: {current_image_count}, attempting to add: {len(images)}',
                        'field': 'images'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_images = []
            errors = []
            
            for idx, image_file in enumerate(images):
                try:
                    validate_image_file(image_file)
                except Exception as e:
                    error_message = str(e)
                    if 'format' in error_message.lower():
                        errors.append({
                            'index': idx,
                            'error': 'invalid_format',
                            'message': 'Unsupported file format. Only JPEG, PNG, and WebP formats are supported.',
                            'filename': image_file.name
                        })
                        continue
                    elif 'size' in error_message.lower():
                        errors.append({
                            'index': idx,
                            'error': 'file_too_large',
                            'message': error_message,
                            'filename': image_file.name
                        })
                        continue
                    elif 'dimensions' in error_message.lower():
                        errors.append({
                            'index': idx,
                            'error': 'dimensions_exceeded',
                            'message': error_message,
                            'filename': image_file.name
                        })
                        continue
                    else:
                        errors.append({
                            'index': idx,
                            'error': 'invalid_image',
                            'message': 'Invalid or corrupted image file',
                            'filename': image_file.name
                        })
                        continue
                
                # Get metadata for this image (support array or single values)
                is_primary = False
                display_order = idx
                alt_text = ''
                caption = ''
                
                # Handle array-based metadata if provided
                if isinstance(request.data.get('is_primary'), list) and idx < len(request.data.get('is_primary', [])):
                    is_primary = request.data.get('is_primary')[idx]
                elif not isinstance(request.data.get('is_primary'), list):
                    is_primary = request.data.get('is_primary', False) if idx == 0 else False
                
                if isinstance(request.data.get('display_order'), list) and idx < len(request.data.get('display_order', [])):
                    display_order = request.data.get('display_order')[idx]
                elif not isinstance(request.data.get('display_order'), list):
                    display_order = request.data.get('display_order', idx)
                
                if isinstance(request.data.get('alt_text'), list) and idx < len(request.data.get('alt_text', [])):
                    alt_text = request.data.get('alt_text')[idx]
                elif not isinstance(request.data.get('alt_text'), list):
                    alt_text = request.data.get('alt_text', '') if idx == 0 else ''
                
                if isinstance(request.data.get('caption'), list) and idx < len(request.data.get('caption', [])):
                    caption = request.data.get('caption')[idx]
                elif not isinstance(request.data.get('caption'), list):
                    caption = request.data.get('caption', '') if idx == 0 else ''
                
                try:
                    with transaction.atomic():
                        product_image = ProductImage.objects.create(
                            product=product,
                            image=image_file,
                            is_primary=is_primary,
                            display_order=display_order,
                            alt_text=alt_text,
                            caption=caption
                        )
                        
                        serializer = ProductImageSerializer(product_image, context={'request': request})
                        uploaded_images.append(serializer.data)
                except (OSError, IOError) as e:
                    # Handle disk space errors and storage issues
                    errors.append({
                        'index': idx,
                        'error': 'storage_error',
                        'message': 'Storage unavailable. Unable to save image file. Insufficient storage space or storage error.',
                        'filename': image_file.name
                    })
                except (DatabaseError, OperationalError) as e:
                    # Handle database connection errors during maintenance
                    errors.append({
                        'index': idx,
                        'error': 'database_error',
                        'message': 'Database temporarily unavailable. Please try again later.',
                        'filename': image_file.name
                    })
                except Exception as e:
                    errors.append({
                        'index': idx,
                        'error': 'upload_failed',
                        'message': f'Failed to upload image: {str(e)}',
                        'filename': image_file.name
                    })
            
            # Return response
            if errors and not uploaded_images:
                return Response(
                    {
                        'error': 'upload_failed',
                        'message': 'All image uploads failed',
                        'errors': errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            response_data = {
                'uploaded': uploaded_images,
                'count': len(uploaded_images)
            }
            
            if errors:
                response_data['errors'] = errors
                return Response(response_data, status=status.HTTP_200_OK)
            
            # Single image returns single object, multiple returns array
            if len(uploaded_images) == 1 and single_image:
                return Response(uploaded_images[0], status=status.HTTP_201_CREATED)
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {
                    'error': 'server_error',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, product_id, image_id):
        """Update/replace an existing product image."""
        try:
            product = get_object_or_404(FishProduct, id=product_id)
            product_image = get_object_or_404(ProductImage, id=image_id, product=product)
            
            old_image_path = product_image.image.path if product_image.image else None
            
            if 'image' in request.FILES:
                image_file = request.FILES['image']
                
                try:
                    validate_image_file(image_file)
                except Exception as e:
                    error_message = str(e)
                    if 'format' in error_message.lower():
                        return Response(
                            {
                                'error': 'invalid_format',
                                'message': 'Unsupported file format. Only JPEG, PNG, and WebP formats are supported.',
                                'field': 'image'
                            },
                            status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
                        )
                    elif 'size' in error_message.lower():
                        return Response(
                            {
                                'error': 'file_too_large',
                                'message': error_message,
                                'field': 'image'
                            },
                            status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                        )
                    else:
                        return Response(
                            {
                                'error': 'invalid_image',
                                'message': 'Invalid or corrupted image file',
                                'field': 'image'
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                product_image.image = image_file
            
            is_primary = request.data.get('is_primary', product_image.is_primary)
            display_order = request.data.get('display_order', product_image.display_order)
            alt_text = request.data.get('alt_text', product_image.alt_text)
            caption = request.data.get('caption', product_image.caption)
            
            try:
                with transaction.atomic():
                    product_image.is_primary = is_primary
                    product_image.display_order = display_order
                    product_image.alt_text = alt_text
                    product_image.caption = caption
                    product_image.save()
                    
                    if old_image_path and os.path.isfile(old_image_path):
                        try:
                            os.remove(old_image_path)
                        except OSError:
                            pass
                    
                    serializer = ProductImageSerializer(product_image, context={'request': request})
                    return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {
                        'error': 'update_failed',
                        'message': f'Failed to update image: {str(e)}',
                        'field': 'image'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {
                    'error': 'server_error',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, product_id, image_id):
        """Delete a product image."""
        try:
            product = get_object_or_404(FishProduct, id=product_id)
            product_image = get_object_or_404(ProductImage, id=image_id, product=product)
            
            image_path = product_image.image.path if product_image.image else None
            product_image.delete()
            
            if image_path and os.path.isfile(image_path):
                try:
                    os.remove(image_path)
                except OSError:
                    pass
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {
                    'error': 'server_error',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )