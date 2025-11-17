from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Category, FishProduct, PlantCategory


class CatalogProductTests(APITestCase):
    def setUp(self):
        self.fish_category = Category.objects.create(
            name="Community Fish",
            slug="community-fish",
            description="Peaceful fish",
            display_order=0,
            is_active=True,
        )
        self.plant_category = PlantCategory.objects.create(
            name="Sword Plants",
            slug="sword-plants",
            description="Background plants",
            display_order=0,
            is_active=True,
        )

        self.fish_product = FishProduct.objects.create(
            species_name="Neon Tetra",
            scientific_name="Paracheirodon innesi",
            description="Colorful schooling fish",
            price=4.99,
            stock_quantity=50,
            is_available=True,
            difficulty_level="beginner",
            min_tank_size_gallons=10,
            care_instructions="Keep in schools",
        )
        self.fish_product.categories.add(self.fish_category)

        self.plant_product = FishProduct.objects.create(
            species_name="Amazon Sword",
            botanical_name="Echinodorus amazonicus",
            description="Classic background plant",
            price=12.99,
            stock_quantity=25,
            is_available=True,
            difficulty_level="beginner",
            product_type="plant",
            min_tank_size_gallons=20,
            care_instructions="Nutrient-rich substrate",
            plant_category=self.plant_category,
            plant_light_requirements="medium",
            plant_growth_rate="medium",
            plant_co2_requirement="optional",
        )

    def test_filter_products_by_product_type(self):
        url = reverse('product-list')
        response = self.client.get(url, {'product_type': 'plant'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], str(self.plant_product.id))
        self.assertEqual(results[0]['product_type'], 'plant')

    def test_category_filter_supports_plant_category_slugs(self):
        url = reverse('product-list')
        response = self.client.get(url, {'category': self.plant_category.slug})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['plant_category']['slug'], self.plant_category.slug)

    def test_stock_gating_excludes_unavailable_products(self):
        self.plant_product.is_available = False
        self.plant_product.save()
        url = reverse('product-list')
        response = self.client.get(url, {'product_type': 'plant'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data.get('results', [])), 0)

    def test_plant_categories_endpoint_returns_active_records(self):
        url = reverse('plant-category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], self.plant_category.name)

