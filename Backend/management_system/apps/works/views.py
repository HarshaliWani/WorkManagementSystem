# apps/works/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Work, Spill
from .serializers import SpillSerializer

class SpillViewSet(viewsets.ModelViewSet):
    queryset = Spill.objects.all()
    serializer_class = SpillSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new spill for a work"""
        work_id = request.data.get('work_id')
        ara = request.data.get('ARA')
        
        try:
            work = Work.objects.get(id=work_id)
            
            # Validate that RA + total ARA < AA
            total_ara = work.spills.aggregate(total=models.Sum('ARA'))['total'] or 0
            if work.RA + total_ara + ara >= work.AA:
                return Response(
                    {'error': 'Cannot add spill: RA + ARA would exceed AA'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            spill = Spill.objects.create(work=work, ARA=ara)
            serializer = self.get_serializer(spill)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Work.DoesNotExist:
            return Response(
                {'error': 'Work not found'},
                status=status.HTTP_404_NOT_FOUND
            )
