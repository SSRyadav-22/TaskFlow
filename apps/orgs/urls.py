from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganisationViewSet

router = DefaultRouter()
router.register('', OrganisationViewSet, basename='org')

urlpatterns = [
    path('', include(router.urls)),
]
