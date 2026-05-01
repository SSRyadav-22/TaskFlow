from django.contrib import admin
from .models import Organisation, OrgMember


class OrgMemberInline(admin.TabularInline):
    model = OrgMember
    extra = 0
    readonly_fields = ('joined_at',)
    autocomplete_fields = ('user',)


@admin.register(Organisation)
class OrganisationAdmin(admin.ModelAdmin):
    list_display    = ('name', 'slug', 'is_open', 'member_count', 'created_at')
    list_filter     = ('is_open',)
    search_fields   = ('name', 'slug')
    readonly_fields = ('created_at',)
    prepopulated_fields = {'slug': ('name',)}
    inlines = [OrgMemberInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'


@admin.register(OrgMember)
class OrgMemberAdmin(admin.ModelAdmin):
    list_display  = ('user', 'org', 'role', 'joined_at')
    list_filter   = ('org', 'role')
    search_fields = ('user__email', 'user__username', 'org__name')
    readonly_fields = ('joined_at',)
