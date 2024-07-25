from django.contrib.auth.decorators import login_required
from django.http import HttpResponse

@login_required
def test(request):
    response = f"""
    User: {request.user}
    User username: {request.user.username}
    User email: {request.user.email}
    User First Name: {request.user.first_name}


"""
    return HttpResponse(response)
