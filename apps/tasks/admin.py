from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display  = ('title', 'project', 'assigned_to', 'status', 'priority', 'due_date', 'is_overdue', 'created_at')
    list_filter   = ('status', 'priority', 'project')
    search_fields = ('title', 'assigned_to__email', 'project__name')
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    ordering = ('-created_at',)

    def is_overdue(self, obj):
        return obj.is_overdue
    is_overdue.boolean = True
    is_overdue.short_description = 'Overdue?'
