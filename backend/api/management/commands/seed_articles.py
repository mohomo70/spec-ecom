"""
Management command to seed articles and categories.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Article, ArticleCategory
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed articles and categories for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--articles',
            type=int,
            default=50,
            help='Number of articles to create (default: 50)',
        )

    def handle(self, *args, **options):
        num_articles = options['articles']
        
        self.stdout.write('Creating categories...')
        categories = self.create_categories()
        
        self.stdout.write('Getting or creating admin user...')
        admin_user = self.get_or_create_admin()
        
        self.stdout.write(f'Creating {num_articles} articles...')
        self.create_articles(categories, admin_user, num_articles)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(categories)} categories and {num_articles} articles!'
            )
        )

    def create_categories(self):
        categories_data = [
            {
                'name': 'Aquascaping',
                'description': 'Learn about creating beautiful underwater landscapes, plant selection, hardscape design, and aquascaping techniques.',
            },
            {
                'name': 'Fish Care',
                'description': 'Essential guides on fish health, feeding, water parameters, disease prevention, and proper fish care practices.',
            },
            {
                'name': 'Tank Setup',
                'description': 'Complete guides for setting up new aquariums, equipment selection, cycling, and initial setup procedures.',
            },
            {
                'name': 'Water Chemistry',
                'description': 'Understanding pH, ammonia, nitrites, nitrates, and maintaining optimal water parameters for your aquarium.',
            },
            {
                'name': 'Plant Care',
                'description': 'Aquatic plant care, fertilization, CO2 systems, lighting requirements, and plant propagation techniques.',
            },
            {
                'name': 'Breeding',
                'description': 'Fish breeding guides, spawning techniques, fry care, and breeding setup requirements.',
            },
            {
                'name': 'Equipment Reviews',
                'description': 'Honest reviews of filters, heaters, lights, CO2 systems, and other aquarium equipment.',
            },
            {
                'name': 'Beginner Guides',
                'description': 'Essential information for new aquarists, common mistakes to avoid, and getting started tips.',
            },
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = ArticleCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'  Created category: {category.name}')
            else:
                self.stdout.write(f'  Category already exists: {category.name}')
        
        return categories

    def get_or_create_admin(self):
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user:
                admin_user.role = 'admin'
                admin_user.save()
            else:
                self.stdout.write(
                    self.style.WARNING(
                        'No admin user found. Please create an admin user first.'
                    )
                )
                return None
        return admin_user

    def create_articles(self, categories, admin_user, num_articles):
        if not admin_user:
            self.stdout.write(
                self.style.ERROR('Cannot create articles without an admin user.')
            )
            return

        aquascaping = ArticleCategory.objects.get(name='Aquascaping')
        fish_care = ArticleCategory.objects.get(name='Fish Care')
        
        article_templates = [
            {
                'title': 'Complete Guide to {category}',
                'content': '<p>This comprehensive guide covers everything you need to know about {category_lower}. Whether you are a beginner or an experienced hobbyist, this article provides valuable insights and practical tips.</p><h2>Introduction</h2><p>Getting started with {category_lower} can be both exciting and overwhelming. This guide will walk you through the essential concepts and best practices.</p><h2>Key Concepts</h2><p>Understanding the fundamentals is crucial for success. Here are the most important aspects to consider:</p><ul><li>Proper planning and research</li><li>Quality equipment selection</li><li>Regular maintenance routines</li><li>Patience and observation</li></ul><h2>Best Practices</h2><p>Following established best practices will help you avoid common pitfalls and achieve better results. Always start with a solid foundation and build from there.</p><h2>Conclusion</h2><p>With the right knowledge and approach, {category_lower} can be a rewarding hobby. Remember to take your time and enjoy the process.</p>',
                'excerpt': 'A comprehensive guide covering all aspects of {category_lower}, from basics to advanced techniques.',
            },
            {
                'title': 'Top 10 Tips for {category} Success',
                'content': '<p>Here are the top 10 tips that will help you succeed with {category_lower}.</p><h2>1. Start with Research</h2><p>Before diving in, spend time researching your specific needs and requirements.</p><h2>2. Invest in Quality Equipment</h2><p>Quality equipment may cost more initially but will save you money and headaches in the long run.</p><h2>3. Maintain Consistency</h2><p>Regular maintenance is key to long-term success. Create a schedule and stick to it.</p><h2>4. Monitor Parameters</h2><p>Keep a close eye on water parameters and make adjustments as needed.</p><h2>5. Be Patient</h2><p>Good things take time. Avoid rushing the process and let nature take its course.</p><h2>6. Learn from Others</h2><p>Join communities, read forums, and learn from experienced hobbyists.</p><h2>7. Document Your Journey</h2><p>Keep notes and photos to track your progress and learn from your experiences.</p><h2>8. Don\'t Overstock</h2><p>Start with fewer inhabitants and gradually add more as your system stabilizes.</p><h2>9. Quarantine New Additions</h2><p>Always quarantine new fish or plants before adding them to your main tank.</p><h2>10. Enjoy the Process</h2><p>Remember why you started this hobby and enjoy every step of the journey.</p>',
                'excerpt': 'Discover the top 10 essential tips for achieving success with {category_lower}.',
            },
            {
                'title': 'Common Mistakes in {category} and How to Avoid Them',
                'content': '<p>Many hobbyists make similar mistakes when starting with {category_lower}. This article highlights the most common pitfalls and how to avoid them.</p><h2>Mistake 1: Insufficient Research</h2><p>Jumping in without proper research is one of the biggest mistakes. Take time to understand the requirements.</p><h2>Mistake 2: Overfeeding</h2><p>Overfeeding is a common issue that leads to water quality problems. Feed only what your fish can consume in a few minutes.</p><h2>Mistake 3: Inadequate Filtration</h2><p>Proper filtration is essential. Don\'t skimp on filter capacity or maintenance.</p><h2>Mistake 4: Ignoring Water Parameters</h2><p>Regular testing and adjustment of water parameters is crucial for success.</p><h2>Mistake 5: Adding Too Many Fish Too Quickly</h2><p>Patience is key. Allow your tank to cycle properly before adding inhabitants.</p><h2>Conclusion</h2><p>By avoiding these common mistakes, you\'ll set yourself up for success in {category_lower}.</p>',
                'excerpt': 'Learn about the most common mistakes in {category_lower} and how to prevent them.',
            },
            {
                'title': 'Advanced Techniques for {category}',
                'content': '<p>Once you\'ve mastered the basics, these advanced techniques will take your {category_lower} skills to the next level.</p><h2>Advanced Setup Methods</h2><p>Explore sophisticated setup techniques that experienced hobbyists use to achieve exceptional results.</p><h2>Optimization Strategies</h2><p>Learn how to optimize every aspect of your system for maximum efficiency and results.</p><h2>Problem Solving</h2><p>Develop advanced problem-solving skills to handle complex situations and challenges.</p><h2>Innovation and Experimentation</h2><p>Don\'t be afraid to experiment with new techniques and approaches while maintaining best practices.</p>',
                'excerpt': 'Take your {category_lower} skills to the next level with these advanced techniques.',
            },
            {
                'title': 'Beginner\'s Guide to {category}',
                'content': '<p>New to {category_lower}? This beginner-friendly guide will help you get started on the right foot.</p><h2>Getting Started</h2><p>Starting your journey in {category_lower} begins with understanding the basics and gathering the right information.</p><h2>Essential Equipment</h2><p>Learn about the essential equipment you\'ll need and why each piece is important.</p><h2>First Steps</h2><p>Follow these step-by-step instructions to begin your {category_lower} journey successfully.</p><h2>What to Expect</h2><p>Understanding what to expect will help you prepare and avoid surprises along the way.</p><h2>Next Steps</h2><p>Once you\'ve mastered the basics, here\'s what to focus on next.</p>',
                'excerpt': 'A beginner-friendly guide to getting started with {category_lower}.',
            },
        ]
        
        featured_images = [
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
        ]
        
        created_count = 0
        for i in range(num_articles):
            category = random.choice(categories)
            template = random.choice(article_templates)
            
            category_lower = category.name.lower()
            title = template['title'].format(category=category.name, category_lower=category_lower)
            content = template['content'].format(category=category.name, category_lower=category_lower)
            excerpt = template['excerpt'].format(category=category.name, category_lower=category_lower)
            
            status = random.choice(['published', 'draft'])
            published_at = None
            if status == 'published':
                days_ago = random.randint(0, 180)
                published_at = timezone.now() - timedelta(days=days_ago)
            
            has_featured_image = random.choice([True, True, True, False])
            featured_image_url = ''
            featured_image_alt_text = ''
            if has_featured_image:
                featured_image_url = random.choice(featured_images)
                featured_image_alt_text = f"{title} - Featured image showing {category_lower} setup"
            
            article = Article(
                title=title,
                content=content,
                excerpt=excerpt,
                featured_image_url=featured_image_url,
                featured_image_alt_text=featured_image_alt_text,
                category=category,
                author=admin_user,
                status=status,
                meta_title=title[:60] if len(title) <= 60 else title[:57] + '...',
                meta_description=excerpt[:160] if len(excerpt) <= 160 else excerpt[:157] + '...',
                published_at=published_at,
            )
            article.save()
            
            created_count += 1
            if created_count % 10 == 0:
                self.stdout.write(f'  Created {created_count} articles...')

