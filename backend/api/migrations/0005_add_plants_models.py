from django.db import migrations, models
import django.db.models.deletion
import uuid


def json_default_list():
    return []


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_add_image_models'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlantCategory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=120, unique=True)),
                ('description', models.TextField(blank=True)),
                ('display_order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'plant_categories',
                'ordering': ['display_order', 'name'],
            },
        ),
        migrations.AddIndex(
            model_name='plantcategory',
            index=models.Index(fields=['slug'], name='plant_categor_slug_idx'),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='botanical_name',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='hero_eligible',
            field=models.BooleanField(default=False, help_text='Eligible for homepage hero/quick-link promotion'),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_care_notes',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='api.plantcategory'),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_co2_requirement',
            field=models.CharField(blank=True, choices=[('none', 'None'), ('optional', 'Optional'), ('recommended', 'Recommended')], max_length=20),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_compatible_fauna',
            field=models.JSONField(blank=True, default=json_default_list, help_text='List of compatible fish species'),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_difficulty',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_growth_rate',
            field=models.CharField(blank=True, choices=[('slow', 'Slow'), ('medium', 'Medium'), ('fast', 'Fast')], max_length=20),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_light_requirements',
            field=models.CharField(blank=True, help_text='e.g., low, medium, high', max_length=50),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_max_height_cm',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_spread_cm',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='plant_substrate_preference',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='fishproduct',
            name='product_type',
            field=models.CharField(choices=[('fish', 'Fish'), ('plant', 'Plant'), ('accessory', 'Accessory')], db_index=True, default='fish', max_length=20),
        ),
        migrations.AddIndex(
            model_name='fishproduct',
            index=models.Index(fields=['product_type'], name='fish_product_type_idx'),
        ),
    ]
