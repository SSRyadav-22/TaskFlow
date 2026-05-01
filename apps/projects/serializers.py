from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember

User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'user_email', 'username', 'role', 'joined_at']


class ProjectSerializer(serializers.ModelSerializer):
    owner_email   = serializers.EmailField(source='owner.email', read_only=True)
    org_name      = serializers.CharField(source='org.name', read_only=True)
    members_count = serializers.SerializerMethodField()
    tasks_count   = serializers.SerializerMethodField()
    project_members = ProjectMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'org', 'org_name',
            'owner', 'owner_email',
            'members_count', 'tasks_count', 'project_members',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['owner']

    def get_members_count(self, obj):
        return obj.members.count()

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def create(self, validated_data):
        project = Project.objects.create(
            owner=self.context['request'].user,
            **validated_data
        )
        # Auto-add owner as admin member
        ProjectMember.objects.create(
            project=project,
            user=self.context['request'].user,
            role='admin'
        )
        return project


class AddMemberSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role = serializers.ChoiceField(choices=['admin', 'member'], default='member')
