from django.contrib.auth.decorators import login_required
from django.http import HttpResponse

@login_required
def test(request):
    return HttpResponse('User: '+request.user.email)

@login_required
def custom(request):
    long_url = ''
    custom_phrase = ''
    email = request.user.email
    # add entry in db 
    # return ()