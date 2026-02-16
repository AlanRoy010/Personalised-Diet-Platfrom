
from flask import Blueprint, request, make_response, jsonify
from decorators import jwt_required, admin_required
import globals
import bcrypt
from bson.binary import Binary


clients = globals.db.clients
users = globals.db.users

admins_bp = Blueprint("admins_bp", __name__)

@admins_bp.route('/clients', methods=['GET'])
@jwt_required
@admin_required #all clients can only be accessed by an admin user.
def getAllclients():
    data_to_return = []
    page_num = request.args.get('pn', default=1, type=int)
    page_size = request.args.get('ps', default=10, type=int)
    page_start = (page_num - 1) * page_size

    try:
        clients_cursor = clients.find().skip(page_start).limit(page_size)

        for client in clients_cursor:
            client['_id'] = str(client['_id'])

            data_to_return.append(client)

        return make_response(jsonify(data_to_return), 200)
    except ConnectionError:
        return make_response(jsonify({"error":"No mongodb connection"}), 500)
    except Exception as e:
        return make_response(jsonify({"error":"No mongodb connection","details":str(e)}), 500)
    


@admins_bp.route('/users', methods=['GET'])
@jwt_required
@admin_required
def list_users():
    try:
        # ----------------------------
        # 1. Extract query parameters
        # ----------------------------
        page = int(request.args.get('pn', 1))
        page_size = int(request.args.get('ps', 10))
        search = request.args.get('q', "").strip()

        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 10

        skip = (page - 1) * page_size

        # ----------------------------
        # 2. Build MongoDB query
        # ----------------------------
        query = {}
        if search:
            regex = {"$regex": search, "$options": "i"}
            query = {
                "$or": [
                    {"name": regex},
                    {"username": regex},
                    {"email": regex}
                ]
            }

        # ----------------------------
        # 3. Count total documents
        # ----------------------------
        try:
            total = users.count_documents(query)
        except Exception as e:
            return make_response(jsonify({"error": "Database count failed", "details": str(e)}), 500)

        # ----------------------------
        # 4. Fetch paginated results
        # ----------------------------
        try:
            cursor = (
                users.find(query)
                .skip(skip)
                .limit(page_size)
            )
        except Exception as e:
            return make_response(jsonify({"error": "Database query failed", "details": str(e)}), 500)

        # ----------------------------
        # 5. Build response list
        # ----------------------------
        user_list = []
        for u in cursor:
            user_list.append({
                "_id": str(u.get("_id")),
                "name": u.get("name", ""),
                "username": u.get("username", ""),
                "email": u.get("email", ""),
                "admin": bool(u.get("admin", False))
            })

        # ----------------------------
        # 6. Return successful response
        # ----------------------------
        return make_response(jsonify({
            "users": user_list,
            "total": total,
            "page": page,
            "page_size": page_size
        }), 200)

    # ----------------------------
    # ERROR HANDLING
    # ----------------------------
    except ConnectionError:
        return make_response(
            jsonify({"error": "Database connection failed"}),
            500
        )

    except Exception as e:
        return make_response(
            jsonify({"error": "Server error", "details": str(e)}),
            500
        )
    
#-------------------------------------- group clients by field ---------------------------------------------------------------------------

@admins_bp.route('/clients/grouped', methods=['GET'])
@jwt_required
@admin_required                     
def clients_grouped():                          #group the clients based on a fields like weight, age, height..etc

    group_by = request.args.get('group_by')
    if not group_by:
        return make_response(jsonify({"error": "Please provide a 'group_by' query parameter"}), 400)

    pipeline = [
        {"$match": {group_by: {"$exists": True}}},  
        {"$project": {
            "group_key": f"${group_by}",
            "name": "$Personal_info.name",
            "username": "$Personal_info.username",
            "id": {"$toString": "$_id"}
        }},
        {"$group": {
            "_id": "$group_key",
            "clients": {"$push": {"id": "$id", "name": "$name", "username": "$username"}}
        }},
        {"$sort": {"_id": 1}} 
    ]

    result = clients.aggregate(pipeline)
    output = {doc["_id"]: doc["clients"] for doc in result}

    return make_response(jsonify(output), 200)

#--------------------------------------  Get clients nearby ---------------------------------------------------------------------------

@admins_bp.route('/clients/nearby', methods=['GET'])
@jwt_required
@admin_required
def nearby_clients():                           #this method is to find nearby clients using the location coordinates.
    for client in clients.aggregate([{"$sample": {"size": 1}}]):
        random_client = client
        break
    if not random_client:
        return make_response(jsonify({"error": "No clients found"}), 404)

    coordinates = random_client["Personal_info"]["location"]["coordinates"]

    pipeline = [
        {
            "$geoNear": {                                                     #used geoNear aggregation here !!
                "near": {"type": "Point", "coordinates": coordinates},
                "distanceField": "distance",
                "spherical": True,
                "maxDistance": 5000,  
                "minDistance": 1       
            }
        },
        {
            "$project": {
                "_id": {"$toString": "$_id"},
                "name": "$Personal_info.name",
                "town": "$Personal_info.location.town",
                "distance_m": "$distance"
            }
        },
        {"$limit": 10}
    ]

    nearby = list(clients.aggregate(pipeline))   
    response = {
        "random_client": {
            "id": str(random_client["_id"]),
            "name": random_client["Personal_info"]["name"],
            "town": random_client["Personal_info"]["location"]["town"]
        },
        "nearby_clients": nearby
    }

    return make_response(jsonify(response), 200)

@admins_bp.route('/users', methods=['POST'])
@jwt_required
@admin_required
def createUser():
    data = request.form

    required_fields = ["name", "username", "password", "email"]
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {missing_fields}"}), 400
    if users.find_one({"username": data["username"]}):
        return make_response(jsonify({"error": "Username already exists"}), 400)

    hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())

    new_user = {
        "name":data.get("name"),
        "username": data.get("username"),
        "password": hashed_password,
        "email": data.get("email"),
        "admin": data.get("admin")  
    }

    result = users.insert_one(new_user)
    profile_id = str(result.inserted_id)
    profile_link = f"http://127.0.0.1:5000/users/{profile_id}"
    return make_response(jsonify({"message": "User registered successfully","URL": profile_link}), 201)
