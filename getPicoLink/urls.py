"""
URL configuration for getPicoLink project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, re_path, include
from django.shortcuts import redirect
from django.views.generic import RedirectView
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls')),

    # just botchung together the endpoints
    # [TODO] handle URIs more elegently
    path('load/', views.user_urls),
    path('custompico/', views.custom_url),
    path('delete/<str:custom_phrase>/', views.delete_url),
    path('update/<str:custom_phrase>/', views.update_url),
    re_path(r'^(?P<url_hash>[A-Za-z0-9_-]+)/$', include('api.urls')),   #[+]/[*{0}]
    path('get/', include('api.urls')),  #get/[+]
    path('accounts/', include('allauth.urls')),
    path('auth/', include('users.urls')),
    path('accounts/login/', RedirectView.as_view(url='/accounts/google/login/')),
    path('accounts/signup/', RedirectView.as_view(url='/accounts/google/login/')),
]