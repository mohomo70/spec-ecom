from pathlib import Path

from django.apps import apps
from django.conf import settings
from django.core.management import BaseCommand, CommandError, call_command


class Command(BaseCommand):
    help = "Seed plant categories (and optional samples) for the aquarium catalog."

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-categories",
            action="store_true",
            help="Skip loading the default plant category fixture.",
        )
        parser.add_argument(
            "--sample-products",
            action="store_true",
            help="Create sample plant products if the PlantProduct model is available.",
        )

    def handle(self, *args, **options):
        plant_category_model = self.get_model("PlantCategory")
        fixture_path = Path(settings.BASE_DIR) / "api" / "fixtures" / "plant_categories.json"

        if not fixture_path.exists():
            raise CommandError(f"Fixture file not found at {fixture_path}")

        if not options["skip_categories"]:
            self.stdout.write("Loading default plant categories fixture...")
            call_command("loaddata", str(fixture_path))
            self.stdout.write(self.style.SUCCESS("Plant categories loaded."))

        if options["sample_products"]:
            self.seed_sample_products(plant_category_model)

    def seed_sample_products(self, plant_category_model):
        plant_product_model = self.get_model("PlantProduct", required=False)
        if not plant_product_model:
            self.stdout.write(
                self.style.WARNING(
                    "PlantProduct model not available. Skipping sample product creation."
                )
            )
            return

        sample_data = [
            {
                "name": "Monte Carlo",
                "botanical_name": "Micranthemum tweediei",
                "category_slug": "carpeting-plants",
            },
            {
                "name": "Amazon Sword",
                "botanical_name": "Echinodorus grisebachii",
                "category_slug": "sword-plants",
            },
            {
                "name": "Rotala Rotundifolia",
                "botanical_name": "Rotala rotundifolia",
                "category_slug": "stem-plants",
            },
        ]

        created_count = 0
        for plant in sample_data:
            try:
                category = plant_category_model.objects.get(slug=plant["category_slug"])
            except plant_category_model.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Category with slug '{plant['category_slug']}' not found. Skipping {plant['name']}."
                    )
                )
                continue

            obj, created = plant_product_model.objects.get_or_create(
                name=plant["name"],
                defaults={
                    "botanical_name": plant["botanical_name"],
                    "category": category,
                },
            )
            if created:
                created_count += 1

        if created_count:
            self.stdout.write(self.style.SUCCESS(f"Created {created_count} sample plant products."))
        else:
            self.stdout.write("Sample plant products already exist; nothing to do.")

    def get_model(self, model_name: str, required: bool = True):
        try:
            return apps.get_model("api", model_name)
        except LookupError:
            if required:
                raise CommandError(
                    f"Model api.{model_name} is not available. "
                    "Ensure migrations have been applied before running this command."
                )
            return None

