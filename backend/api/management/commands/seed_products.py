"""
Seed products data for freshwater fish ecommerce platform.
Run with: python manage.py shell -c "from api.management.commands.seed_products import load_sample_data; load_sample_data()"
"""

import os
from django.conf import settings
from django.core.files import File
from api.models import Category, FishProduct, ProductImage, User


def load_sample_data():
    """Load comprehensive sample data for the freshwater fish ecommerce platform."""

    print("Loading sample data...")

    # Create categories
    categories_data = [
        {
            'name': 'Community Fish',
            'slug': 'community-fish',
            'description': 'Peaceful fish that can be kept together in community tanks',
            'display_order': 1,
        },
        {
            'name': 'Cichlids',
            'slug': 'cichlids',
            'description': 'Active and colorful cichlid species from Africa and South America',
            'display_order': 2,
        },
        {
            'name': 'Tetras & Barbs',
            'slug': 'tetras-barbs',
            'description': 'Small schooling fish that add movement and color to aquariums',
            'display_order': 3,
        },
        {
            'name': 'Catfish & Bottom Dwellers',
            'slug': 'catfish-bottom-dwellers',
            'description': 'Bottom-dwelling species that help keep tanks clean',
            'display_order': 4,
        },
        {
            'name': 'Livebearers',
            'slug': 'livebearers',
            'description': 'Fish that give birth to live young, easy to breed',
            'display_order': 5,
        },
        {
            'name': 'Goldfish & Koi',
            'slug': 'goldfish-koi',
            'description': 'Popular coldwater species for outdoor ponds and tanks',
            'display_order': 6,
        },
    ]

    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        categories[cat_data['slug']] = category
        if created:
            print(f"Created category: {category.name}")

    # Sample fish products with image mappings
    products_data = [
        # Community Fish
        {
            'species_name': 'Neon Tetra',
            'scientific_name': 'Paracheirodon innesi',
            'description': 'Beautiful schooling fish with striking blue and red stripes. Perfect for community tanks and creates a stunning display when kept in groups.',
            'price': 2.99,
            'stock_quantity': 150,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 10,
            'ph_range_min': 5.8,
            'ph_range_max': 7.0,
            'temperature_range_min': 72,
            'temperature_range_max': 78,
            'max_size_inches': 1.5,
            'lifespan_years': 5,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Excellent community fish. Keep in groups of 6+. Avoid aggressive fish.',
            'care_instructions': 'Keep in soft, slightly acidic water. Feed small amounts twice daily. Regular water changes essential.',
            'seo_title': 'Neon Tetra Fish - Schooling Community Fish',
            'seo_description': 'Buy vibrant Neon Tetra fish online. Perfect for beginners, stunning blue and red stripes.',
            'categories': [categories['community-fish'], categories['tetras-barbs']],
            'image_path': None,
        },
        {
            'species_name': 'Guppy',
            'scientific_name': 'Poecilia reticulata',
            'description': 'Colorful and active livebearer with flowing fins. Males display vibrant colors and elaborate tail fins. Easy to breed and care for.',
            'price': 3.49,
            'stock_quantity': 200,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 5,
            'ph_range_min': 6.8,
            'ph_range_max': 7.8,
            'temperature_range_min': 72,
            'temperature_range_max': 82,
            'max_size_inches': 2.5,
            'lifespan_years': 2,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Peaceful community fish. Males can be territorial. Keep with similar sized peaceful fish.',
            'care_instructions': 'Hardy and adaptable. Feed flake food daily. Provide hiding spots. Regular water changes.',
            'seo_title': 'Guppy Fish - Colorful Livebearer Fish',
            'seo_description': 'Purchase beautiful Guppy fish online. Vibrant colors, easy care, perfect for beginners.',
            'categories': [categories['community-fish'], categories['livebearers']],
            'image_path': 'products/2025/11/12/guppy.png',
        },
        {
            'species_name': 'Betta Fish',
            'scientific_name': 'Betta splendens',
            'description': 'Siamese fighting fish with flowing fins and vibrant colors. Males are territorial and should be kept alone or with very peaceful tankmates.',
            'price': 7.99,
            'stock_quantity': 75,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 5,
            'ph_range_min': 6.5,
            'ph_range_max': 7.5,
            'temperature_range_min': 75,
            'temperature_range_max': 82,
            'max_size_inches': 3.0,
            'lifespan_years': 3,
            'diet_type': 'carnivore',
            'compatibility_notes': 'Males are aggressive. Keep alone or with shrimp/snellies. Females can sometimes be kept together.',
            'care_instructions': 'Provide warm water and hiding spots. Feed betta pellets daily. Clean water essential.',
            'seo_title': 'Betta Fish - Siamese Fighting Fish',
            'seo_description': 'Buy stunning Betta fish online. Vibrant colors, flowing fins, easy care.',
            'categories': [categories['community-fish']],
            'image_path': 'products/2025/11/12/yupp-generated-image-478759.jpg',
        },
        {
            'species_name': 'Zebrafish',
            'scientific_name': 'Danio rerio',
            'description': 'Striped zebrafish known for their active swimming and hardiness. Excellent for breeding studies and community tanks.',
            'price': 1.99,
            'stock_quantity': 300,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 10,
            'ph_range_min': 6.5,
            'ph_range_max': 8.0,
            'temperature_range_min': 64,
            'temperature_range_max': 74,
            'max_size_inches': 2.0,
            'lifespan_years': 5,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Very peaceful schooling fish. Keep in groups. Good with most community fish.',
            'care_instructions': 'Cool water species. Feed varied diet. Active swimmers need space. Easy breeders.',
            'seo_title': 'Zebrafish - Active Striped Community Fish',
            'seo_description': 'Purchase Zebrafish online. Hardy, active swimmers with distinctive stripes.',
            'categories': [categories['community-fish'], categories['tetras-barbs']],
            'image_path': None,
        },

        # Cichlids
        {
            'species_name': 'Angelfish',
            'scientific_name': 'Pterophyllum scalare',
            'description': 'Elegant freshwater angelfish with tall body and flowing fins. Peaceful cichlids that add grace to any aquarium.',
            'price': 12.99,
            'stock_quantity': 45,
            'difficulty_level': 'intermediate',
            'min_tank_size_gallons': 30,
            'ph_range_min': 6.5,
            'ph_range_max': 7.5,
            'temperature_range_min': 78,
            'temperature_range_max': 84,
            'max_size_inches': 6.0,
            'lifespan_years': 10,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Generally peaceful but can be territorial during breeding. Keep with similar sized fish.',
            'care_instructions': 'Need tall tanks for fin growth. Feed varied diet. Provide hiding spots. Sensitive to water quality.',
            'seo_title': 'Angelfish - Elegant Freshwater Cichlids',
            'seo_description': 'Buy beautiful Angelfish online. Graceful swimmers with flowing fins.',
            'categories': [categories['cichlids']],
            'image_path': None,
        },
        {
            'species_name': 'Convict Cichlid',
            'scientific_name': 'Amatitlania nigrofasciata',
            'description': 'Bold and active Central American cichlid with distinctive black and white stripes. Excellent parents and tank cleaners.',
            'price': 8.99,
            'stock_quantity': 60,
            'difficulty_level': 'intermediate',
            'min_tank_size_gallons': 30,
            'ph_range_min': 6.5,
            'ph_range_max': 8.0,
            'temperature_range_min': 72,
            'temperature_range_max': 82,
            'max_size_inches': 4.0,
            'lifespan_years': 8,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Semi-aggressive. Best kept as breeding pair or in cichlid-only tank. Excellent parents.',
            'care_instructions': 'Provide rock structures for breeding. Feed varied diet. Can be territorial. Good algae eaters.',
            'seo_title': 'Convict Cichlid - Bold Striped Cichlids',
            'seo_description': 'Purchase Convict Cichlids online. Active, good parents, natural tank cleaners.',
            'categories': [categories['cichlids']],
            'image_path': None,
        },

        # Catfish
        {
            'species_name': 'Corydoras Catfish',
            'scientific_name': 'Corydoras aeneus',
            'description': 'Peaceful bottom-dwelling catfish that help keep tanks clean. Bronze coloration with distinctive barbels.',
            'price': 4.99,
            'stock_quantity': 120,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 20,
            'ph_range_min': 6.0,
            'ph_range_max': 8.0,
            'temperature_range_min': 72,
            'temperature_range_max': 78,
            'max_size_inches': 2.5,
            'lifespan_years': 5,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Very peaceful. Keep in groups of 3+. Excellent community fish. Help clean bottom.',
            'care_instructions': 'Bottom dwellers need soft substrate. Feed sinking pellets. Peaceful and hardy.',
            'seo_title': 'Corydoras Catfish - Peaceful Bottom Dwellers',
            'seo_description': 'Buy Corydoras catfish online. Peaceful scavengers that keep tanks clean.',
            'categories': [categories['catfish-bottom-dwellers']],
            'image_path': None,
        },
        {
            'species_name': 'Plecostomus',
            'scientific_name': 'Hypostomus plecostomus',
            'description': 'Common pleco that grows large and helps control algae. Also known as sucker catfish.',
            'price': 15.99,
            'stock_quantity': 25,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 50,
            'ph_range_min': 6.5,
            'ph_range_max': 7.5,
            'temperature_range_min': 72,
            'temperature_range_max': 82,
            'max_size_inches': 24.0,
            'lifespan_years': 15,
            'diet_type': 'herbivore',
            'compatibility_notes': 'Generally peaceful but can be territorial. Needs large tank space. Good algae control.',
            'care_instructions': 'Grows very large - plan accordingly. Feed algae wafers and vegetables. Provide hiding spots.',
            'seo_title': 'Plecostomus - Large Algae-Eating Catfish',
            'seo_description': 'Purchase Plecostomus catfish online. Natural algae eaters that grow large.',
            'categories': [categories['catfish-bottom-dwellers']],
            'image_path': None,
        },

        # Goldfish
        {
            'species_name': 'Fancy Goldfish',
            'scientific_name': 'Carassius auratus',
            'description': 'Beautiful fancy goldfish with flowing fins and distinctive colors. Includes varieties like Oranda, Ryukin, and Telescope.',
            'price': 9.99,
            'stock_quantity': 80,
            'difficulty_level': 'intermediate',
            'min_tank_size_gallons': 30,
            'ph_range_min': 7.0,
            'ph_range_max': 8.0,
            'temperature_range_min': 65,
            'temperature_range_max': 75,
            'max_size_inches': 8.0,
            'lifespan_years': 10,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Keep with other goldfish or alone. Fancy varieties are delicate. Need good filtration.',
            'care_instructions': 'Cold water species. Feed goldfish pellets. Provide space for swimming. Sensitive to water quality.',
            'seo_title': 'Fancy Goldfish - Beautiful Flowing Fin Varieties',
            'seo_description': 'Buy fancy Goldfish online. Oranda, Ryukin, Telescope varieties.',
            'categories': [categories['goldfish-koi']],
            'image_path': None,
        },
        {
            'species_name': 'Shubunkin Goldfish',
            'scientific_name': 'Carassius auratus',
            'description': 'Hardy goldfish with calico coloration and flowing fins. More active than fancy varieties and better for outdoor ponds.',
            'price': 6.99,
            'stock_quantity': 95,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 20,
            'ph_range_min': 7.0,
            'ph_range_max': 8.0,
            'temperature_range_min': 60,
            'temperature_range_max': 75,
            'max_size_inches': 12.0,
            'lifespan_years': 15,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Hardy and active. Can be kept with other goldfish. Good for outdoor ponds in summer.',
            'care_instructions': 'Very hardy species. Can tolerate cooler temperatures. Feed varied diet. Active swimmers.',
            'seo_title': 'Shubunkin Goldfish - Hardy Calico Goldfish',
            'seo_description': 'Purchase Shubunkin Goldfish online. Hardy, active swimmers with calico colors.',
            'categories': [categories['goldfish-koi']],
            'image_path': None,
        },

        # More Tetras
        {
            'species_name': 'Cardinal Tetra',
            'scientific_name': 'Paracheirodon axelrodi',
            'description': 'Stunning red and blue tetra with iridescent scales. More peaceful than neon tetras but similar care requirements.',
            'price': 3.49,
            'stock_quantity': 100,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 10,
            'ph_range_min': 5.5,
            'ph_range_max': 7.0,
            'temperature_range_min': 72,
            'temperature_range_max': 78,
            'max_size_inches': 1.5,
            'lifespan_years': 5,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Very peaceful schooling fish. Keep in groups. Excellent for community tanks.',
            'care_instructions': 'Soft, acidic water preferred. Feed small amounts twice daily. Sensitive to water quality.',
            'seo_title': 'Cardinal Tetra Fish - Stunning Red and Blue Tetras',
            'seo_description': 'Buy Cardinal Tetra fish online. Beautiful red and blue colors, peaceful schooling fish.',
            'categories': [categories['tetras-barbs'], categories['community-fish']],
            'image_path': None,
        },
        {
            'species_name': 'Cherry Barb',
            'scientific_name': 'Puntius titteya',
            'description': 'Bright red barb with black markings. Active and peaceful schooling fish that add color to community tanks.',
            'price': 2.49,
            'stock_quantity': 180,
            'difficulty_level': 'beginner',
            'min_tank_size_gallons': 15,
            'ph_range_min': 6.0,
            'ph_range_max': 8.0,
            'temperature_range_min': 72,
            'temperature_range_max': 82,
            'max_size_inches': 2.0,
            'lifespan_years': 5,
            'diet_type': 'omnivore',
            'compatibility_notes': 'Peaceful schooling fish. Keep in groups of 6+. Good with most community fish.',
            'care_instructions': 'Active swimmers need space. Feed varied diet. Can be shy when first introduced.',
            'seo_title': 'Cherry Barb Fish - Bright Red Schooling Fish',
            'seo_description': 'Purchase Cherry Barb fish online. Vibrant red color, peaceful and active.',
            'categories': [categories['tetras-barbs'], categories['community-fish']],
            'image_path': None,
        },
    ]

    for product_data in products_data:
        image_path = product_data.pop('image_path', None)
        categories_list = product_data.pop('categories')
        product, created = FishProduct.objects.get_or_create(
            species_name=product_data['species_name'],
            scientific_name=product_data['scientific_name'],
            defaults=product_data
        )
        if created:
            product.categories.set(categories_list)
            product.save()
            print(f"Created product: {product.species_name}")

            # Add image if path is provided and file exists
            if image_path:
                media_root = settings.MEDIA_ROOT
                full_image_path = os.path.join(media_root, image_path)
                
                if os.path.exists(full_image_path):
                    # Check if image already exists for this product
                    if not ProductImage.objects.filter(product=product, is_primary=True).exists():
                        with open(full_image_path, 'rb') as f:
                            product_image = ProductImage.objects.create(
                                product=product,
                                is_primary=True,
                                display_order=0,
                                alt_text=f"{product.species_name} - {product.scientific_name}",
                                caption=f"Beautiful {product.species_name}"
                            )
                            # Use the existing path structure, Django will handle it
                            filename = os.path.basename(image_path)
                            product_image.image.save(
                                filename,
                                File(f),
                                save=True
                            )
                            print(f"  Added image: {image_path}")
                    else:
                        print(f"  Image already exists for {product.species_name}")
                else:
                    print(f"  Warning: Image file not found: {full_image_path}")

    # Create a superuser for admin access
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print("Created superuser: admin/admin123")

    print("Sample data loaded successfully!")
    print(f"Created {Category.objects.count()} categories")
    print(f"Created {FishProduct.objects.count()} products")
    print(f"Created {ProductImage.objects.count()} product images")
    print(f"Created {User.objects.filter(is_superuser=True).count()} admin users")


if __name__ == '__main__':
    load_sample_data()

