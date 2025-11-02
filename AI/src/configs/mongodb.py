from pymongo import MongoClient

MONGO_URI = "mongodb+srv://dev-align-database:HgspLtpdcHOIm5Pv@capstone-cluster.t8phj3m.mongodb.net/dev-align?retryWrites=true&w=majority"

client: MongoClient = None

def connect_to_mongo():
    global client
    client = MongoClient(MONGO_URI)

def close_mongo_connection():
    global client
    if client:
        client.close() 

def get_database():
    return client.get_database("dev-align")