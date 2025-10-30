from rest_framework import viewsets
from .models import TechnicalSanction
from .serializers import TechnicalSanctionSerializer

class TechnicalSanctionViewSet(viewsets.ModelViewSet):
    queryset = TechnicalSanction.objects.all()
    serializer_class = TechnicalSanctionSerializer
