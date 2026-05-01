from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
        ('orgs', '0002_seed'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='org',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='projects',
                to='orgs.organisation',
            ),
        ),
    ]
