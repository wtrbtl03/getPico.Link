from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.resolve),
    re_path(r'.+', views.shorten),
]