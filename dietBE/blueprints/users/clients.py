
from flask import Blueprint, request, make_response, jsonify
from bson import ObjectId
from decorators import jwt_required
import globals
import random
import bcrypt
from bson.binary import Binary

clients = globals.db.clients
users = globals.db.users

users_bp = Blueprint("users_bp", __name__)

#-------------------------------------- GET METHODS ---------------------------------------------------------------------------
@users_bp.route('/', methods=['GET'])
@jwt_required
def showapp():
    return jsonify({"message":"Welcome to your health app"})

    
@users_bp.route('/clients/<string:client_id>', methods=['GET'])
@jwt_required                                               # get client by ID can be accessed by any users, 
def get_A_client(client_id):                                #but the normal users(not admins) can only see their 
    profile = clients.find_one({"_id":ObjectId(client_id)}) #respective userID so they can only view their details.

    if profile is not None:                          #if profile is none the error message will print.
        profile["_id"] = str(profile["_id"])
        return make_response(jsonify(profile), 200)
    else:
        return make_response(jsonify({"Error":"Client profile not found"}), 404)
    
@users_bp.route('/clients/by-user/<string:user_id>', methods=['GET'])
@jwt_required                                               # get client by ID can be accessed by any users, 
def get_A_client_by_user(user_id):                                #but the normal users(not admins) can only see their 
    profile = clients.find_one({"user_id":user_id}) #respective userID so they can only view their details.

    if profile is not None:                          #if profile is none the error message will print.
        profile["_id"] = str(profile["_id"])
        return make_response(jsonify(profile), 200)
    else:
        return make_response(jsonify({"Error":"Client profile not found"}), 404)


@users_bp.route('/users/<string:user_id>', methods=['GET'])
@jwt_required
def get_A_user(user_id):
    profile = users.find_one({"_id":ObjectId(user_id)}, {"password": 0})

    if profile is not None:
        profile["_id"] = str(profile["_id"])
        return make_response(jsonify(profile), 200)
    else:
        return make_response(jsonify({"Error":" User profile not found"}), 404)
    
#--------------------------------------  Locations ---------------------------------------------------------------------------
locations = {                                                #.   These locations are used in the POST-client methods and                                                                       
    "Central London": [51.490, -0.160, 51.525, -0.070],      #.   will asign a random coordinate to the client. 
    "East London": [51.515, 0.000, 51.560, 0.080],
    "West London": [51.480, -0.260, 51.540, -0.190],
    "North London": [51.550, -0.160, 51.610, -0.070],
    "South London": [51.430, -0.160, 51.480, -0.070],
    "Croydon": [51.345, -0.130, 51.395, -0.060],
    "Wembley": [51.540, -0.310, 51.580, -0.260],
    "Richmond": [51.440, -0.310, 51.485, -0.260],
    "Greenwich": [51.470, 0.000, 51.510, 0.050],
    "Ilford": [51.540, 0.050, 51.590, 0.100]
    }
#-------------------------------------- POST METHODS ---------------------------------------------------------------------------

def calculate_bmi(height_cm, weight_kg):         #this function is to calculate the BMI from the weight and height provided
    height_m = height_cm / 100.0
    if height_m <= 0: 
        return make_response(jsonify({"message":"height invalid !!, Enter height in centimeters"}),400)

    return round(weight_kg / (height_m * height_m), 1) #the answer will only have one decimal place


@users_bp.route('/clients/<string:user_id>', methods=['POST'])
@jwt_required  
def add_client(user_id):
    current_username = request.user.get('username')         
    user = users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return make_response(jsonify({"error": "User not found"}), 404)

    
    form_data = request.form.to_dict()
    required_keys = [
    "Age", "Gender", "height_cm", "weight_kg", "phone",
    "systolic", "diastolic", "blood_sugar", "cholesterol",
    "daily_steps", "sleep_hours", "exercise_frequency",
    "Smoking", "Alcohol_Consumption",
    "Dietary_Habits", "Preferred_Cuisine",
    "Caloric_Intake", "Protein_Intake", "Carbohydrate_Intake", "Fat_Intake",
    "town", "Allergies", "Chronic_Disease", "Genetic_Risk_Factor"
    ]
    
    missing_keys = [key for key in required_keys if not form_data.get(key)]
    
    
    for key in required_keys:              #used this 'for' loop so that if any of the client fields are empty
        value = form_data.get(key)         #this will assign appropriate default values for it.
        if not value: 
            if key in ["Age", "height_cm", "weight_kg", "systolic", "diastolic",
                       "blood_sugar", "cholesterol", 
                       "exercise_frequency"]:
                form_data[key] = 0
            elif key in ["Smoking", "Alcohol_Consumption", "phone", "Caloric_Intake", "Gender",
                        "town", "Dietary_Habits", "Preferred_Cuisine", "Protein_Intake", "Carbohydrate_Intake", 
                        "Fat_Intake", "Allergies", "Chronic_Disease", "Genetic_Risk_Factor",
                        "Daily_Steps", "Sleep_Hours"]:
                form_data[key] = "Unknown"
            else:
                form_data[key] = ""
    
    height_cm = int(form_data.get("height_cm"))     
    weight_kg = int(form_data.get("weight_kg"))
    if height_cm > 0 : 
        BMI = calculate_bmi(height_cm, weight_kg)
    else:
        BMI = 0

    towns_in_London = list(locations.keys())
    town = form_data.get("town")
    if town not in locations:
        return make_response(jsonify({"Error": f"Town '{town}' not recognized. Please enter a town from: {towns_in_London}"}), 400)
    
    lat_min, lng_min, lat_max, lng_max = locations[town]
    rand_x = lng_min + (lng_max - lng_min) * (random.randint(0, 100) / 100)
    rand_y = lat_min + (lat_max - lat_min) * (random.randint(0, 100) / 100)


    new_profile = {
        "user_id": str(user['_id']),
        "Personal_info": {
            "name": user.get("name"),       #for client the values like name, username and email_id will be taken from user data
            "username": user.get("username"),
            "Age": int(form_data.get("Age")),
            "Gender": form_data.get("Gender"),
            "body_metrics": {
                "height_cm": height_cm,
                "weight_kg": weight_kg,
                "BMI": BMI
            },
            "contact": {
                "email_id": user.get("email"),
                "phone": form_data.get("phone")
            },
            "location": {
                "town": form_data.get("town"),
                "type": "Point",
                "coordinates": [rand_x, rand_y]
            }
        },
        "Health_Profile": {
            "Vitals": {
                "Blood_Pressure": {
                    "Systolic": int(form_data.get("systolic")),
                    "Diastolic": int(form_data.get("diastolic"))
                },
            },
            "Labs": {
                "Blood_Sugar_Level": int(form_data.get("blood_sugar")),
                "Cholesterol_Level": int(form_data.get("cholesterol"))
            }
        },
        "Life_Style": {
            "Daily_Steps": form_data.get("Daily_Steps"),
            "Sleep_Hours": form_data.get("Sleep_Hours"),
            "Exercise_Frequency": form_data.get("Exercise_Frequency"),
            "Habits": {
                "Smoking": form_data.get("Smoking"),
                "Alcohol_Consumption": form_data.get("Alcohol_Consumption")
            }
        },
        "Diet": {
            "Habits": {
                "Dietary_Habits": form_data.get("Dietary_Habits"),
                "Preferred_Cuisine": form_data.get("Preferred_Cuisine")
            },
            "Intakes": {
                "Caloric_Intake": form_data.get("Caloric_Intake"),
                "Carbohydrate_Intake": form_data.get("Carbohydrate_Intake"),
                "Protein_Intake": form_data.get("Protein_Intake"),
                "Fat_Intake": form_data.get("Fat_Intake")
            }
        }
    }
    result = clients.insert_one(new_profile)
    profile_id = str(result.inserted_id)
    profile_link = f"http://127.0.0.1:5000/clients/{profile_id}"

    if missing_keys:
        missing_key_message = f"The following fields were missing: {missing_keys}"
    else: 
        missing_key_message = ''

    return make_response(jsonify({"message": "Client profile created successfully","URL": profile_link, "missing_fields": missing_key_message}), 201)




#-------------------------------------- DELETE METHODS ---------------------------------------------------------------------------

@users_bp.route('/clients/<string:client_id>', methods=['DELETE'])
@jwt_required #here normal users can only see their own userID so they can only delete their information.
def deleteClient(client_id):
    results = clients.delete_one({"_id":ObjectId(client_id)})

    if results.deleted_count == 1:
        return make_response(jsonify({"message":"client details deleted"}), 200)
    else:
        return make_response(jsonify({"Error":"No Client ID found"}),404)
    
@users_bp.route('/users/<string:user_id>', methods=['DELETE'])
@jwt_required 
def deleteUser(user_id):
    try:
        try:
            oid = ObjectId(user_id)
        except Exception:
            return make_response(jsonify({"error": "Invalid user id"}), 400)

        # 1) Delete the user
        user_result = users.delete_one({"_id": oid})

        if user_result.deleted_count == 0:
            return make_response(jsonify({"error": "No User ID found"}), 404)

        # 2) Delete any clients linked to this user
        # ⚠️ IMPORTANT: adjust "user_id" to match your actual field name in client docs
        client_result = clients.delete_many({"user_id": user_id})
        # If you store ObjectId instead of string, use:
        # client_result = clients.delete_many({"user_id": oid})

        return make_response(jsonify({
            "message": "User and related clients deleted",
            "clients_deleted": client_result.deleted_count
        }), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Server error", "details": str(e)}), 500)
    
#-------------------------------------- PUT METHODS ---------------------------------------------------------------------------
@users_bp.route('/clients/<string:client_id>', methods=['PUT'])
@jwt_required
def update_ClientProfile(client_id):
    data = request.form  

    update_field = {}

    if data.get("name"):
        update_field["Personal_info.name"] = data.get("name")
    if data.get("username"):
        update_field["Personal_info.username"] = data.get("username")
    if data.get("email"):
        update_field["Personal_info.contact.email_id"] = data.get("email")
    if data.get("Age"):
        update_field["Personal_info.Age"] = int(data.get("Age"))
    if data.get("Gender"):
        update_field["Personal_info.Gender"] = data.get("Gender")
    if data.get("height_cm"):
        update_field["Personal_info.body_metrics.height_cm"] = float(data.get("height_cm"))
    if data.get("weight_kg"):
        update_field["Personal_info.body_metrics.weight"] = float(data.get("weight_kg"))
    if data.get("phone"):
        update_field["Personal_info.contact.phone"] = float(data.get("phone"))
    
    if data.get("town"):
        town = data.get("town")
        # Update the town name
        update_field["Personal_info.location.town"] = town

        # Also refresh coordinates based on your locations dict
        if town in locations:
            lat_min, lng_min, lat_max, lng_max = locations[town]
            rand_x = lng_min + (lng_max - lng_min) * (random.randint(0, 100) / 100)
            rand_y = lat_min + (lat_max - lat_min) * (random.randint(0, 100) / 100)
            update_field["Personal_info.location.coordinates"] = [rand_x, rand_y]

    if data.get("systolic"):
        update_field["Health_Profile.Vitals.Blood_Pressure.Systolic"] = int(data.get("systolic"))
    if data.get("diastolic"):
        update_field["Health_Profile.Vitals.Blood_Pressure.Diastolic"] = int(data.get("diastolic"))
    if data.get("blood_sugar"):
        update_field["Health_Profile.Labs.Blood_Sugar_Level"] = int(data.get("blood_sugar"))
    if data.get("cholesterol"):
        update_field["Health_Profile.Labs.Cholesterol_Level"] = int(data.get("cholesterol"))
    if data.get("Allergies"):
        update_field["Health_Profile.Health_risks.Allergies"] = data.get("Allergies")
    if data.get("Genetic_Risk_Factor"):
        update_field["Health_Profile.Health_risks.Genetic_Risk_Factor"] = data.get("Genetic_Risk_Factor")
    if data.get("Chronic_Disease"):
        update_field["Health_Profile.Health_risks.Chronic_Disease"] = data.get("Chronic_Disease")
    if data.get("Daily_Steps"):
        update_field["Life Style.Daily Steps"] = int(data.get("Daily_Steps"))
    if data.get("Sleep Hours"):
        update_field["Life Style.Sleep Hours"] = int(data.get("Sleep Hours"))
    if data.get("Exercise Frequency"):
        update_field["Life Style.Exercise Frequency"] = int(data.get("Exercise Frequency"))
    if data.get("Smoking"):
        update_field["Life Style.Habits.Smoking"] = data.get("Smoking")
    if data.get("Alcohol_Consumption"):
        update_field["Life Style.Habits.Alcohol_Consumption"] = data.get("Alcohol_Consumption")
    if data.get("Dietary_Habits"):
        update_field["Diet.Habits.Dietary_Habits"] = data.get("Dietary_Habits")
    if data.get("Preferred_Cuisine"):
        update_field["Diet.Habits.Preferred_Cuisine"] = data.get("Preferred_Cuisine")
    if data.get("Food_Aversions"):
        update_field["Diet.Habits.Food_Aversions"] = data.get("Food_Aversions")
    if data.get("Caloric_Intake"):
        update_field["Diet.Intakes.Caloric_Intake"] = data.get("Caloric_Intake")
    if data.get("Protein_Intake"):
        update_field["Diet.Intakes.Protein_Intake"] = data.get("Protein_Intake")
    if data.get("Carbohydrate_Intake"):
        update_field["Diet.Intakes.Carbohydrate_Intake"] = data.get("Carbohydrate_Intake")
    if data.get("Fat_Intake"):
        update_field["Diet.Intakes.Fat_Intake"] = data.get("Fat_Intake")
    

    if not update_field:
        return make_response(jsonify({"message":"No changes made"}), 200)


    results = clients.update_one(
        {"_id": ObjectId(client_id)},
        {"$set": update_field}
    )

    if results.modified_count == 1:
        updated_profile_link = f"http://127.0.0.1:5000/clients/{client_id}"
        return make_response(jsonify({"message": "Profile updated successfully", "URL": updated_profile_link}), 200)
    else:
        return make_response(jsonify({"message":"No changes made"}), 201)
    

@users_bp.route('/users/<user_id>', methods=['PUT'])
@jwt_required
def update_user(user_id):
    # Angular sends JSON, so use request.get_json()
    data = request.get_json(silent=True) or {}

    update_fields = {}

    if "name" in data and data["name"]:
        update_fields["name"] = data["name"]

    if "username" in data and data["username"]:
        update_fields["username"] = data["username"]

    if "email" in data and data["email"]:
        update_fields["email"] = data["email"]

    # admin will usually come as boolean from Angular
    if "admin" in data:
        update_fields["admin"] = bool(data["admin"])

    # Optional: only if you actually send password from frontend
    if "password" in data and data["password"]:
        hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())
        update_fields["password"] = Binary(hashed_pw)

    if not update_fields:
        return make_response(jsonify({"error": "No valid data passed"}), 400)

    result = users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        return make_response(jsonify({"error": "User not found"}), 404)

    # Fetch the updated user document to return to frontend
    updated_user = users.find_one({"_id": ObjectId(user_id)})

    user_out = {
        "_id": str(updated_user["_id"]),
        "name": updated_user.get("name", ""),
        "username": updated_user.get("username", ""),
        "email": updated_user.get("email", ""),
        "admin": bool(updated_user.get("admin", False))
    }

    return make_response(jsonify(user_out), 200)

from flask import request, jsonify, make_response
from bson.objectid import ObjectId

def _to_float(value):
    """
    Helper: safely convert strings like "1200" or "" to float or None.
    """
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

@users_bp.route('/clients/<string:client_id>/diet-plan', methods=['GET'])
@jwt_required
def generate_diet_plan(client_id):
    try:
        client = clients.find_one({"_id": ObjectId(client_id)})
        if not client:
            return make_response(jsonify({"error": "Client not found"}), 404)

        personal   = client.get("Personal_info", {})
        health     = client.get("Health_Profile", {})
        lifestyle  = client.get("Life_Style", {})
        diet       = client.get("Diet", {})


        intakes = diet.get("Intakes", {})
        calorie_intake   = _to_float(intakes.get("Caloric_Intake"))
        carb_intake      = _to_float(intakes.get("Carbohydrate_Intake"))
        protein_intake   = _to_float(intakes.get("Protein_Intake"))
        fat_intake       = _to_float(intakes.get("Fat_Intake"))

        vitals   = health.get("Vitals", {})
        bp       = vitals.get("Blood_Pressure", {})
        systolic = _to_float(bp.get("Systolic"))
        diastolic = _to_float(bp.get("Diastolic"))

        labs         = health.get("Labs", {})
        blood_sugar  = _to_float(labs.get("Blood_Sugar_Level"))

        sleep_hours   = _to_float(lifestyle.get("Sleep_Hours"))
        exercise_freq = _to_float(lifestyle.get("Exercise_Frequency"))

        recommendations = []
        flags = {}

        # ---------- Calories ---------
        if calorie_intake is not None:
            if calorie_intake > 2600:
                flags["calories"] = "high"
                recommendations.append(
                    "Your current calorie intake seems high. Consider a lower-calorie meal plan: "
                    "more vegetables, lean protein (like chicken, fish, lentils), and smaller portions of high-fat or sugary foods."
                )
            elif calorie_intake < 1500:
                flags["calories"] = "low"
                recommendations.append(
                    "Your calorie intake looks quite low. Make sure you are eating enough to support your energy needs. "
                    "Include balanced meals with whole grains, lean protein, and healthy fats."
                )
            else:
                flags["calories"] = "ok"

        # ---------- Protein --------------
        if protein_intake is not None:
            if protein_intake < 50:
                flags["protein"] = "low"
                recommendations.append(
                    "Your protein intake appears low. Try adding more protein-rich foods such as eggs, yoghurt, lentils, beans, fish, or lean meat."
                )
            elif protein_intake > 150:
                flags["protein"] = "high"
                recommendations.append(
                    "Your protein intake seems quite high. Ensure you balance it with enough vegetables, fruits, and whole grains, "
                    "and speak to a healthcare professional if you have kidney or liver problems."
                )
            else:
                flags["protein"] = "ok"

        # ---------- Fat --------
        if fat_intake is not None:
            if fat_intake > 90:
                flags["fat"] = "high"
                recommendations.append(
                    "Your fat intake seems high. Try to reduce fried foods and choose healthier fats such as nuts, seeds, avocado, and olive oil."
                )
            else:
                flags["fat"] = "ok"

        # ---------- Carbohydrates -------------
        if carb_intake is not None:
            if carb_intake > 350:
                flags["carbs"] = "high"
                recommendations.append(
                    "Your carbohydrate intake looks high. Consider choosing more whole grains (brown rice, wholemeal bread, oats) "
                    "and fewer refined carbs and sugary snacks."
                )
            else:
                flags["carbs"] = "ok"

        # ---------- Blood pressure ----------
        if systolic is not None and diastolic is not None:
            if systolic >= 140 or diastolic >= 90:
                flags["blood_pressure"] = "high"
                recommendations.append(
                    "Your blood pressure reading looks high. Reduce salt intake, avoid processed foods, maintain a healthy weight, "
                    "stay physically active, and speak to a healthcare professional for proper assessment."
                )
            else:
                flags["blood_pressure"] = "ok"

        # ---------- Blood sugar -----------
        if blood_sugar is not None:
            if blood_sugar >= 126:  
                flags["blood_sugar"] = "high"
                recommendations.append(
                    "Your blood sugar level appears high. Consider a lower-sugar diet: limit sugary drinks, sweets, and desserts, "
                    "choose whole grains, and spread carbohydrate intake evenly through the day. Always follow advice from your doctor or nurse."
                )
            else:
                flags["blood_sugar"] = "ok"

        # ---------- Sleep ----------
        if sleep_hours is not None:
            if sleep_hours < 7:
                flags["sleep"] = "low"
                recommendations.append(
                    "You reported low sleep hours. Aim for around 7–9 hours of sleep per night. "
                    "Try a regular bedtime, limit screens before bed, and create a calm sleep environment."
                )
            elif sleep_hours > 10:
                flags["sleep"] = "high"
                recommendations.append(
                    "You reported very long sleep. If you feel tired despite long sleep, consider discussing this with a healthcare professional."
                )
            else:
                flags["sleep"] = "ok"

        # ---------- Exercise ----------
        if exercise_freq is not None:
            if exercise_freq < 3:
                flags["exercise"] = "low"
                recommendations.append(
                    "Your exercise frequency is low. Aim for at least 150 minutes of moderate activity per week "
                    "(for example brisk walking, cycling, or light jogging) spread over most days."
                )
            else:
                flags["exercise"] = "ok"

        # if we have no specific recommendations, give a standard balanced plan
        if not recommendations:
            recommendations.extend([
                "Follow a balanced plate: fill about half your plate with vegetables or salad, "
                "a quarter with lean protein (chicken, fish, eggs, beans or lentils), and a quarter with whole grains "
                "such as brown rice, wholemeal bread or chapati.",
                "Limit sugary drinks and snacks. Choose water, sugar-free drinks, whole fruits and small portions of "
                "healthy snacks like nuts or yoghurt instead of sweets and biscuits.",
                "Use healthier fats: cook with small amounts of vegetable oils (such as olive or rapeseed oil) "
                "and avoid too many fried or very creamy foods.",
                "Aim for regular meals through the day (for example breakfast, lunch and dinner) instead of skipping meals "
                "and then eating a very large portion at once.",
                "Try to stay active most days of the week. Even simple activities like walking, using stairs, or light home exercises "
                "can support your general health."
            ])

        # General note
        recommendations.append(
            "This plan is for general information only and is not a medical diagnosis. "
            "Always speak to a doctor or dietitian before making major changes to your diet or treatment."
        )

        plan = {
            "client_id": str(client["_id"]),
            "client_name": personal.get("name"),
            "flags": flags,
            "recommendations": recommendations
        }

        return make_response(jsonify(plan), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Server error", "details": str(e)}), 500)
