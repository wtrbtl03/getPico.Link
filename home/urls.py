from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('g', views.g),
    path('home/', views.home),
]
