from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, dashboard

router = DefaultRouter()
router.register('', TaskViewSet, basename='task')

urlpatterns = [
    path('dashboard/', dashboard, name='dashboard'),
    path('', include(router.urls)),
]
