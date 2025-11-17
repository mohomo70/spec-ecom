"""
Django management command to seed the database with sample data.
Run with: python manage.py seed_database
"""

from django.core.management.base import BaseCommand
from api.management.commands.seed_products import load_sample_data


class Command(BaseCommand):
    help = 'Seed the database with sample products, categories, and admin user'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))
        try:
            load_sample_data()
            self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error seeding database: {str(e)}'))
            raise

