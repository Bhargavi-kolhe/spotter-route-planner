from django.urls import path
from .views import trip

urlpatterns = [
    path('trip/', trip),
]