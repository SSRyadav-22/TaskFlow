from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer, AddMemberSerializer
from .permissions import IsProjectAdmin, IsProjectMember

User = get_user_model()


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        org_id = self.request.headers.get('X-Org-Id')

        qs = Project.objects.all()
        if org_id:
            qs = qs.filter(org_id=org_id)

        if user.role == 'admin':
            return qs
        return qs.filter(members=user)

    @action(detail=True, methods=['post'], url_path='add-member')
    def add_member(self, request, pk=None):
        project = self.get_object()
        # Only project admins or global admins can add members
        is_project_admin = ProjectMember.objects.filter(
            project=project, user=request.user, role='admin'
        ).exists()
        if not (is_project_admin or request.user.role == 'admin'):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AddMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = get_object_or_404(User, id=serializer.validated_data['user_id'])

        member, created = ProjectMember.objects.get_or_create(
            project=project,
            user=user,
            defaults={'role': serializer.validated_data['role']}
        )
        if not created:
            return Response({'detail': 'User is already a member.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ProjectMemberSerializer(member).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='remove-member/(?P<user_id>[^/.]+)')
    def remove_member(self, request, pk=None, user_id=None):
        project = self.get_object()
        is_project_admin = ProjectMember.objects.filter(
            project=project, user=request.user, role='admin'
        ).exists()
        if not (is_project_admin or request.user.role == 'admin'):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        member = get_object_or_404(ProjectMember, project=project, user_id=user_id)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='members')
    def members(self, request, pk=None):
        project = self.get_object()
        members = ProjectMember.objects.filter(project=project)
        return Response(ProjectMemberSerializer(members, many=True).data)
