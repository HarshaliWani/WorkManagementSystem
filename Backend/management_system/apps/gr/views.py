from rest_framework import viewsets
from .models import GR
from .serializers import grSerializer

class GRViewSet(viewsets.ModelViewSet):
    queryset = GR.objects.all()
    serializer_class = grSerializer
