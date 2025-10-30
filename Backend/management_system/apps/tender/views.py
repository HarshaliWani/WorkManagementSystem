from rest_framework import viewsets
from .models import Tender
from .serializers import TenderSerializer

class TenderViewSet(viewsets.ModelViewSet):
    queryset = Tender.objects.all()
    serializer_class = TenderSerializer
