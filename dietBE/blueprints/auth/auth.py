
from flask import Blueprint, jsonify, request, make_response
from decorators import jwt_required

import bcrypt
import jwt
import globals
import datetime

auth_bp = Blueprint("auth_bp", __name__)

blacklist = globals.db.blacklist
users = globals.db.users

@auth_bp.route('/login', methods=['GET'])
def login():
    auth = request.authorization
    if auth:
        user = users.find_one({"username":auth.username})
        if user is not None:
            if bcrypt.checkpw(bytes(auth.password, 'UTF-8'), user['password']):               
                token = jwt.encode({
                    'username':auth.username,
                    'admin':user.get('admin', False),
                    'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=30)

                }, globals.SECRET_KEY, algorithm='HS256')

                return make_response(jsonify({
                    'token': token,
                    'message': 'Login Succesful!!',
                    'username': auth.username,      
                    'user_id': str(user['_id']),     
                    'admin': user.get('admin', False)
                }), 200)
            
                # return make_response(jsonify({'token':token, 'message': 'Login Succesful!!'}), 200)
            else:
                return make_response(jsonify({"message":"invalid password"}),401)
        else: 
            return make_response(jsonify({"message":"invalid username"}),401)
    return make_response(jsonify({"message":"authentication required"}), 401)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    required_fields = ["name", "username", "password", "email"]
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {missing_fields}"}), 400
    if users.find_one({"username": data["username"]}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())

    new_user = {
        "name":data.get("name"),
        "username": data.get("username"),
        "password": hashed_password,
        "email": data.get("email"),
        "admin": False  
    }

    result = users.insert_one(new_user)
    profile_id = str(result.inserted_id)
    profile_link = f"http://127.0.0.1:5000/users/{profile_id}"
    return make_response(jsonify({"message": "User registered successfully","URL": profile_link}), 201)

@auth_bp.route('/logout', methods=['GET'])
@jwt_required
def logout():
    token = request.headers.get('x-access-token')
    blacklist.insert_one({'token': token})
    return make_response(jsonify({'message':'Logout Successfull'}), 200)

