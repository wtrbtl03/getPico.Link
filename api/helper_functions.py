from .views import COLLECTION
import secrets
import xxhash

CHARSET_BASE62 = "abcedfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

CHARSET_BASE64 = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")

CUSTOM_PHRASE_MIN_LEN = 4
CUSTOM_PHRASE_MAX_LEN = 25

def validate_long_url(long_url):
    pass

def validate_custom_phrase(custom_phrase):
    custom_phrase_len = len(custom_phrase)
    if custom_phrase_len < CUSTOM_PHRASE_MIN_LEN or custom_phrase_len > CUSTOM_PHRASE_MAX_LEN:  # checking if custom phrase is within length bounds
        return False
    if(not all(char in CHARSET_BASE64 for char in custom_phrase)):                              # cheching if custom phrase is Base64 or not
        return False
    try:
        inDB = COLLECTION.find_one({"map_to":  custom_phrase})                                  # checking if same custom phrase exists in database
        print(inDB['map_of'])
        return False
    except:
        return True
    
def get_hash(long_url):
    salt = secrets.token_urlsafe(8)
    salted_url = long_url + salt
    int_hash = xxhash.xxh3_64(salted_url).intdigest()
    
    segments = []
    for _ in range(5):
        segments.append(int_hash % 10000)
        int_hash //= 10000

    short_url_hash = ''
    for segment in segments:
        short_url_hash += CHARSET_BASE62[segment % 62]
    return short_url_hash