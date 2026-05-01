import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Creates or updates a superuser from environment variables'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
        password = os.environ.get('ADMIN_PASSWORD', '')
        username = os.environ.get('ADMIN_USERNAME', 'admin')

        if not password:
            self.stdout.write(self.style.WARNING(
                'ADMIN_PASSWORD not set — skipping admin creation.'
            ))
            return

        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': username}
        )

        # Always make sure this user is a superuser/staff
        user.is_superuser = True
        user.is_staff = True
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(
                f'Superuser created: {email}'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Superuser updated: {email}'
            ))
