from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from apps.gr.views import GRViewSet
from apps.works.views import WorkViewSet
from apps.technical_sanction.views import TechnicalSanctionViewSet
from apps.tender.views import TenderViewSet
from apps.bill.views import BillViewSet

router = routers.DefaultRouter()
router.register(r'grs', GRViewSet)
router.register(r'works', WorkViewSet)
router.register(r'technical-sanctions', TechnicalSanctionViewSet)
router.register(r'tenders', TenderViewSet)
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

# For serving media files in development
from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
