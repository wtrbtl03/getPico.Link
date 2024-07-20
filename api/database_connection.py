from pymongo import MongoClient


def make_connection(conn_str, db_name, collection_name):
    try:
        client = MongoClient(conn_str)
        db = client[db_name]
        collection = db[collection_name]
        return (collection, None)
    except ConnectionError as e:
        return (None, str(e))