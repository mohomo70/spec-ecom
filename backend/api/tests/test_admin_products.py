from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User, PlantCategory, FishProduct


class AdminPlantProductTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="password123",
            role="admin",
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_plant_category(self):
        payload = {
            "name": "Carpeting Plants",
            "slug": "carpeting-plants",
            "description": "Low-growing plants",
            "display_order": 1,
            "is_active": True,
        }
        url = reverse("admin-plant-category-list")
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], payload["name"])

    def test_delete_category_with_products_blocked(self):
        category = PlantCategory.objects.create(name="Stem", slug="stem")
        FishProduct.objects.create(
            product_type="plant",
            species_name="Rotala",
            botanical_name="Rotala rotundifolia",
            description="Fast growing stem plant",
            price=5.99,
            stock_quantity=50,
            difficulty_level="beginner",
            min_tank_size_gallons=10,
            care_instructions="Provide strong light",
            plant_category=category,
        )
        url = reverse("admin-plant-category-detail", args=[category.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category_has_products", list(response.data.values()))

    def test_create_plant_product_requires_botanical_and_category(self):
        url = reverse("admin-product-list")
        payload = {
            "product_type": "plant",
            "species_name": "Anubias",
            "description": "Rhizome plant",
            "price": 9.99,
            "stock_quantity": 40,
            "difficulty_level": "beginner",
            "min_tank_size_gallons": 5,
            "care_instructions": "Attach to hardscape",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("botanical_name", response.data)

    def test_create_plant_product_success(self):
        category = PlantCategory.objects.create(name="Sword", slug="sword")
        url = reverse("admin-product-list")
        payload = {
            "product_type": "plant",
            "species_name": "Amazon Sword",
            "botanical_name": "Echinodorus amazonicus",
            "plant_category_id": str(category.id),
            "price": 7.99,
            "stock_quantity": 25,
            "difficulty_level": "beginner",
            "min_tank_size_gallons": 20,
            "care_instructions": "Nutrient rich substrate",
            "description": "Popular background plant",
            "plant_light_requirements": "medium",
            "plant_co2_requirement": "optional",
            "plant_growth_rate": "medium",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertEqual(data["product_type"], "plant")
        self.assertEqual(data["plant_category"]["id"], str(category.id))
