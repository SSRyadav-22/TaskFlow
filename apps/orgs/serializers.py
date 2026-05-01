from rest_framework import serializers
from django.utils.text import slugify
from .models import Organisation, OrgMember


class OrgMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username   = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model  = OrgMember
        fields = ['id', 'user', 'user_email', 'username', 'role', 'joined_at']
        read_only_fields = ['joined_at']


class OrganisationSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    user_role     = serializers.SerializerMethodField()
    is_member     = serializers.SerializerMethodField()

    class Meta:
        model  = Organisation
        fields = ['id', 'name', 'slug', 'description', 'is_open',
                  'members_count', 'user_role', 'is_member', 'created_at']
        read_only_fields = ['slug', 'created_at']

    def get_members_count(self, obj):
        return obj.members.count()

    def get_user_role(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        member = obj.members.filter(user=request.user).first()
        return member.role if member else None

    def get_is_member(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        return obj.members.filter(user=request.user).exists()

    def create(self, validated_data):
        name = validated_data['name']
        validated_data['slug'] = slugify(name)
        validated_data['created_by'] = self.context['request'].user
        org = Organisation.objects.create(**validated_data)
        # creator becomes owner automatically
        OrgMember.objects.create(org=org, user=self.context['request'].user, role='owner')
        return org
