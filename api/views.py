from django.http import HttpResponse, JsonResponse, Http404
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
# from django.contrib.auth.models import User
import json

from .database_connection import make_connection
from django.conf import settings


DOMAIN_NAME = settings.DOMAIN_NAME

CONN_STR = settings.CONN_STR
DB_NAME = settings.DB_NAME
COLLECTION_NAME = settings.COLLECTION_NAME

# Establish DB Connection
COLLECTION, CONNECTION_ERROR = make_connection(CONN_STR, DB_NAME, COLLECTION_NAME)                      # Returns (connection, None) or (None, error)


from .helper_functions import validate_custom_phrase, get_hash                                          # Importing here to prevent circular import, as validate_custom_phrase() needs the CONNECTION identifier


# GET METHODS

def resolve(request, url_hash):
    if (CONNECTION_ERROR):
        raise Http404("Not Found")
    url_hash = url_hash.rstrip('/')
    try:
        document = COLLECTION.find_one({"map_to":  url_hash})
        target_URL = document["map_of"]
        return redirect(target_URL)
    except:
        raise Http404("Not Found")
    

@login_required
def user_urls(request):
    user_email = request.user.email
    try:
        urls = list(COLLECTION.find({'email': user_email}, {'_id': 0, 'map_of': 1, 'map_to': 1}))
    except:
        urls = []                                                                                       # return empty list if no custom urls for the user
    return JsonResponse(urls, safe=False)


# POST METHODS

def shorten(request):
    if (CONNECTION_ERROR):
        response = {'error': 'Cannot connect to database'}
        return JsonResponse(response)
    full_url = request.get_full_path()
    long_url = full_url[5:]
    print(full_url)
    print(long_url)
    hash = get_hash(long_url)

    shortened_url = f"https://{DOMAIN_NAME}/{hash}"

    new_document = {'map_of': long_url,
                    'map_to': hash}
    COLLECTION.insert_one(new_document)

    response = {'shortened_url': shortened_url}
    return JsonResponse(response)
    

@login_required
def custom_url(request):
    if (CONNECTION_ERROR):
        response = {'error': 'Cannot connect to database'}
        return JsonResponse(response)
    try:
        user_email = request.user.email
    except:
        response = {'error': 'Please sign in to create custom pico links'}
        return JsonResponse(response)
    
    data = json.loads(request.body)
    long_url = data.get('ori_url')
    hash = data.get('short_phrase')

    is_valid = validate_custom_phrase(hash)
    if (not is_valid):
        return JsonResponse({'error': 'Invalid characters, use Base64'}, status='400')
    new_document = {'map_of': long_url,
                    'map_to': hash,
                    'email': user_email}
    COLLECTION.insert_one(new_document)
    shortened_url = f"https://{DOMAIN_NAME}/{hash}"
    response = {'shortened_url': shortened_url}
    return JsonResponse(response)


# PUT METHODS

@login_required
def update_url(request, custom_phrase):
    if (CONNECTION_ERROR):
        response = {'error': 'Cannot connect to database'}
        return JsonResponse(response)
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            new_map_to = data.get('map_to')
            new_map_of = data.get('map_of')
            if (new_map_to != custom_phrase):
                is_valid = validate_custom_phrase(new_map_to)
                if (not is_valid):
                    return JsonResponse({'error': 'Invalid characters, use Base64'})
            result = COLLECTION.update_one(
                {"map_to": custom_phrase, "email": request.user.email},
                {"$set": {"map_to": new_map_to, "map_of": new_map_of}}
            )
            if result.modified_count >= 0:
                return JsonResponse({'status': 'success', 'message': 'URL updated'}, status=200)        # [TODO] use tooltip / auto dissapearing modal
            else:
                return JsonResponse({'error': 'URL not found or not authorized to update'}, status=404)
        except Exception as e:
            return JsonResponse({'error': 'Error updating URL'}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


# DELETE METHODS

@login_required
def delete_url(request, custom_phrase):
    if (CONNECTION_ERROR):
        response = {'error': 'Cannot connect to database'}
        return JsonResponse(response)
    if request.method == 'DELETE':
        try:
            result = COLLECTION.delete_one({"map_to": custom_phrase, "email": request.user.email})
            if result.deleted_count == 1:
                return HttpResponse(status=204)
            else:
                return JsonResponse({'error': 'URL not found or not authorized to delete'}, status=404)
        except Exception as e:
            return JsonResponse({'error': 'Error deleting URL'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)




    







