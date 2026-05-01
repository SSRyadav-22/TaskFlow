from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Organisation, OrgMember
from .serializers import OrganisationSerializer, OrgMemberSerializer


class OrganisationViewSet(viewsets.ModelViewSet):
    serializer_class   = OrganisationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Organisation.objects.all()

    def perform_create(self, serializer):
        # slug + created_by + owner membership handled in serializer.create()
        serializer.save()

    # ── GET /api/orgs/mine/ ── orgs the user already belongs to
    @action(detail=False, methods=['get'], url_path='mine')
    def mine(self, request):
        ids = OrgMember.objects.filter(user=request.user).values_list('org_id', flat=True)
        orgs = Organisation.objects.filter(id__in=ids)
        return Response(OrganisationSerializer(orgs, many=True, context={'request': request}).data)

    # ── POST /api/orgs/{id}/join/ ── join an open org
    @action(detail=True, methods=['post'], url_path='join')
    def join(self, request, pk=None):
        org = self.get_object()
        if not org.is_open:
            return Response(
                {'detail': 'This organisation is invite-only.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        member, created = OrgMember.objects.get_or_create(
            org=org, user=request.user, defaults={'role': 'member'}
        )
        if not created:
            return Response({'detail': 'You are already a member.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrganisationSerializer(org, context={'request': request}).data, status=status.HTTP_201_CREATED)

    # ── GET /api/orgs/{id}/members/ ── list members
    @action(detail=True, methods=['get'], url_path='members')
    def members(self, request, pk=None):
        org = self.get_object()
        members = OrgMember.objects.filter(org=org).select_related('user')
        return Response(OrgMemberSerializer(members, many=True).data)
