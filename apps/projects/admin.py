from django.contrib import admin
from .models import Project, ProjectMember


class ProjectMemberInline(admin.TabularInline):
    """Shows members directly inside the Project detail page."""
    model = ProjectMember
    extra = 0
    fields = ('user', 'role', 'joined_at')
    readonly_fields = ('joined_at',)
    autocomplete_fields = ('user',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display  = ('name', 'owner', 'members_count', 'tasks_count', 'created_at')
    list_filter   = ('created_at',)
    search_fields = ('name', 'owner__email', 'owner__username')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ProjectMemberInline]

    def members_count(self, obj):
        return obj.members.count()
    members_count.short_description = 'Members'

    def tasks_count(self, obj):
        return obj.tasks.count()
    tasks_count.short_description = 'Tasks'


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display  = ('user', 'project', 'role', 'joined_at')
    list_filter   = ('role',)
    search_fields = ('user__email', 'user__username', 'project__name')
    readonly_fields = ('joined_at',)
