from django.shortcuts import render

def home(request):
    return render(request, 'ii.html')

def not_found_404(request):
    return render(request, '404.html', status=404)

def g(request):
    return render(request, 'g.html')