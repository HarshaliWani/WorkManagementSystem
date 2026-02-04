from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from apps.gr.views import GRViewSet
from apps.works.views import SpillViewSet, WorkViewSet
from apps.technical_sanction.views import TechnicalSanctionViewSet
from apps.tender.views import TenderViewSet
from apps.bill.views import BillViewSet
from authentication.views import ApproveUserView
from django.conf import settings
from django.conf.urls.static import static
from status_views import StatusDashboardView

router = routers.DefaultRouter()
router.register(r'grs', GRViewSet)
router.register(r'works', WorkViewSet)
router.register(r'spills', SpillViewSet) 
router.register(r'technical-sanctions', TechnicalSanctionViewSet)
router.register(r'tenders', TenderViewSet)
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # Status dashboard endpoint
    path('api/status/', StatusDashboardView.as_view(), name='status_dashboard'),
    # Demo endpoints (public, no authentication required)
    path('api/demo/', include('apps.demo.urls')),
    # Authentication endpoints
    path('api/auth/', include('authentication.urls')),
    # Admin approval endpoint
    path('api/admin/approve-user/', ApproveUserView.as_view(), name='approve_user'),
    # Legacy JWT endpoints (kept for backward compatibility)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # Serve media files in production (until nginx is configured)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Static files (admin CSS/JS) - also serve in production
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# For serving media files in development
if settings.DEBUG or True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
