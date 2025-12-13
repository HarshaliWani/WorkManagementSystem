from rest_framework import viewsets
from .models import GR
from .serializers import GRSerializer

class GRViewSet(viewsets.ModelViewSet):
    queryset = GR.objects.all()
    serializer_class = GRSerializer
