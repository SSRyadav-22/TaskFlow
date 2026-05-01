from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Organisation(models.Model):
    name        = models.CharField(max_length=200, unique=True)
    slug        = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    is_open     = models.BooleanField(default=True, help_text='Anyone can join without an invite')
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_orgs',
    )
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class OrgMember(models.Model):
    ROLE_CHOICES = [('owner', 'Owner'), ('admin', 'Admin'), ('member', 'Member')]

    org       = models.ForeignKey(Organisation, on_delete=models.CASCADE, related_name='members')
    user      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='org_memberships')
    role      = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['org', 'user'], name='unique_org_member')
        ]

    def __str__(self):
        return f'{self.user.email} @ {self.org.name} ({self.role})'
