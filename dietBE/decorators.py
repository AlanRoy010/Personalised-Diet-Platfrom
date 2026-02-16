
import globals
from flask import request, jsonify, make_response
import jwt
from functools import wraps

blacklist = globals.db.blacklist



def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token: 
            return make_response(jsonify({"Message":"token is missing"}), 401)
        try:
            data = jwt.decode(token, globals.SECRET_KEY, algorithms='HS256') #HS - hasing 
            request.user = data 
        except:
            return make_response(jsonify({"message":"invalid token"}), 401)
        
        bl_token = blacklist.find_one({'token':token}) #blacklist token
        if bl_token is not None:
            return make_response(jsonify({"message":"Token has been cancelled"}), 401)
        
        return func(*args, **kwargs)
    return jwt_required_wrapper


def admin_required(func): #will check the admin field in the  
    @wraps(func)          #user data and if True allows access.
    def admin_required_wrapper(*args, **kwargs):
        if request.user.get('admin', False) is True:
            return func(*args, **kwargs)
        else:
            return make_response(jsonify({"message":"Admins Only"}), 403)
    return admin_required_wrapper

