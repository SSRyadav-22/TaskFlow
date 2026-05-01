from django.db import migrations


def seed_organisations(apps, schema_editor):
    Organisation = apps.get_model('orgs', 'Organisation')
    Organisation.objects.get_or_create(
        name='Ethara',
        defaults={
            'slug': 'ethara',
            'description': 'Ethara.AI — the default company workspace.',
            'is_open': True,
        },
    )
    Organisation.objects.get_or_create(
        name='Random Company',
        defaults={
            'slug': 'random-company',
            'description': 'A sample second organisation.',
            'is_open': True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('orgs', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_organisations, migrations.RunPython.noop),
    ]
