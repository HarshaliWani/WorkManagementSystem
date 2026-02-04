from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DemoGRViewSet,
    DemoWorkViewSet,
    DemoSpillViewSet,
    DemoTechnicalSanctionViewSet,
    DemoTenderViewSet,
    DemoBillViewSet,
    DemoDashboardView,
    DemoStatusDashboardView
)

router = DefaultRouter()
router.register(r'grs', DemoGRViewSet, basename='demo-gr')
router.register(r'works', DemoWorkViewSet, basename='demo-work')
router.register(r'spills', DemoSpillViewSet, basename='demo-spill')
router.register(r'technical-sanctions', DemoTechnicalSanctionViewSet, basename='demo-technical-sanction')
router.register(r'tenders', DemoTenderViewSet, basename='demo-tender')
router.register(r'bills', DemoBillViewSet, basename='demo-bill')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DemoDashboardView.as_view(), name='demo-dashboard'),
    path('status/', DemoStatusDashboardView.as_view(), name='demo-status-dashboard'),
]

