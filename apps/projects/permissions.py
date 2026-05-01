from rest_framework.permissions import BasePermission
from .models import ProjectMember


class IsProjectAdmin(BasePermission):
    """Allow access only to admins of the project."""
    def has_object_permission(self, request, view, obj):
        return ProjectMember.objects.filter(
            project=obj,
            user=request.user,
            role='admin'
        ).exists() or obj.owner == request.user


class IsProjectMember(BasePermission):
    """Allow access only to members of the project."""
    def has_object_permission(self, request, view, obj):
        return ProjectMember.objects.filter(
            project=obj,
            user=request.user
        ).exists() or obj.owner == request.user
