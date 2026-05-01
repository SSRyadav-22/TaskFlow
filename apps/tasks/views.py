from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.projects.models import ProjectMember
from .models import Task
from .serializers import TaskSerializer, TaskStatusSerializer

User = get_user_model()


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related('project', 'assigned_to', 'created_by')

        if user.role == 'admin':
            qs = qs.all()
        else:
            # Members see tasks in their projects
            member_projects = ProjectMember.objects.filter(user=user).values_list('project_id', flat=True)
            qs = qs.filter(project_id__in=member_projects)

        # Filters
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        priority = self.request.query_params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)

        assigned_to_me = self.request.query_params.get('mine')
        if assigned_to_me:
            qs = qs.filter(assigned_to=user)

        overdue = self.request.query_params.get('overdue')
        if overdue:
            qs = qs.filter(due_date__lt=timezone.now().date()).exclude(status='done')

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        project_id = request.data.get('project')
        user = request.user

        # Validate the creator is a project member (unless global admin)
        if user.role != 'admin':
            is_member = ProjectMember.objects.filter(project_id=project_id, user=user).exists()
            if not is_member:
                return Response({'detail': 'You are not a member of this project.'}, status=status.HTTP_403_FORBIDDEN)

        # Validate assigned_to is a project member (if provided)
        assigned_to_id = request.data.get('assigned_to')
        if assigned_to_id:
            is_assignee_member = ProjectMember.objects.filter(
                project_id=project_id, user_id=assigned_to_id
            ).exists()
            if not is_assignee_member:
                return Response(
                    {'detail': 'The assigned user is not a member of this project.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        task = self.get_object()
        serializer = TaskStatusSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(TaskSerializer(task).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard(request):
    user = request.user

    if user.role == 'admin':
        all_tasks = Task.objects.all()
    else:
        member_projects = ProjectMember.objects.filter(user=user).values_list('project_id', flat=True)
        all_tasks = Task.objects.filter(project_id__in=member_projects)

    today = timezone.now().date()
    overdue = all_tasks.filter(due_date__lt=today).exclude(status='done')

    data = {
        'summary': {
            'total': all_tasks.count(),
            'todo': all_tasks.filter(status='todo').count(),
            'in_progress': all_tasks.filter(status='in_progress').count(),
            'done': all_tasks.filter(status='done').count(),
            'overdue': overdue.count(),
        },
        'my_tasks': TaskSerializer(
            all_tasks.filter(assigned_to=user).order_by('due_date')[:5],
            many=True
        ).data,
        'overdue_tasks': TaskSerializer(
            overdue.order_by('due_date')[:5],
            many=True
        ).data,
    }
    return Response(data)
