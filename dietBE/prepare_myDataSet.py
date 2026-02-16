import json
import string
import random
import bcrypt
from pymongo import MongoClient

# with open("Personalized_Diet.json","r") as fin:
#     data = json.load(fin)

# def delRecommendation():
#     for recommendData in data:
#         recommendData.pop("Recommended_Calories", None)
#         recommendData.pop("Recommended_Protein", None)
#         recommendData.pop("Recommended_Carbs", None)
#         recommendData.pop("Recommended_Fats", None)
#         recommendData.pop("Recommended_Meal_Plan", None)



# def createRandom_emailID():
#     names = ["alan", "tom", "mike", "colin", "diane", "paul", "jack", "juliya", "sophia", "tom", "irine", "bindhu", "joyal", "julet", "juana", "jimmy", "merly", "saneesh", "maala", "jiyon", "jiya", "aju", "laisa", "aleena"]
#     domains = ["gmail.com", "yahoo.com", "outlook.com", "redifmail.com"]
#     email_name = random.choice(names) + str(random.randint(4, 1000))
#     return f"{email_name}@{random.choice(domains)}"

# def createRandom_phNo():
#     return f"00{random.randint(100000000, 999999999)}"


# first_names = ["Alan", "Dalus", "Joel", "Alex", "Edwin", "Sam", "Jordan", "Chris", "Taylor", "Jamie", "Robin", "Casey", "Drew", "Morgan"]
# last_names  = ["Smith", "Brown", "Jones", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Clark", "Hall", "George", "Roy", "Shiju", "Jaison", "Pious", "Joy"]

# def createRandom_name():
#     return f"{random.choice(first_names)} {random.choice(last_names)}"

# used_usernames = set()
# def create_username(name):
#     base = name.split()[0].lower()
#     while True:
#         num = random.randint(100, 999)
#         username = f"{base}{num}"
#         if username not in used_usernames:
#             used_usernames.add(username)
#             return username
     


# # specials = "!@#$%^&*_<>"
# # def createPassword(name):
# #     return name.split()[0] + ''.join(random.sample(specials, 2))
    

# def addPersonal_info():
#     for people in data:
#         name = createRandom_name()                  
#         username = create_username(name)       
#         people["Personal_info"] = { 
#             "name":name,
#             "username":username,
#             "Age": people.get("Personal_info", {}).get("age"),
#             "Gender": people.get("Personal_info", {}).get("gender"),
#             "body_metrics":{
#                 "height_cm": people.get("Personal_info", {}).get("body_metrics", {}).get("height"),
#                 "weight_kg": people.get("Personal_info", {}).get("body_metrics", {}).get("weight"),

#             },
#             "contact":{
#                 "email_id":createRandom_emailID(),
#                 "phone":createRandom_phNo()

#             }
#         }
        
#         people.get("Personal_info", {}).pop("age", None)
#         people.get("Personal_info", {}).pop("gender", None)
#         people.get("Personal_info", {}).get("body_metrics", {}).pop("height", None)
#         people.get("Personal_info", {}).get("body_metrics", {}).pop("weight", None)

        


# def addHealthProfile():
#     for people in data:
#         people["Health Profile"] = {
#             "Vitals":{
#                 "Bloop Pressure":{
#                     "Systolic":people.get("Blood_Pressure_Systolic"),
#                     "Diastolic":people.get("Blood_Pressure_Diastolic")
#                 },
#                 "BMI":people.get("BMI")
#             },
#             "Labs":{
#                 "Blood_Sugar_Level":people.get("Blood_Sugar_Level"),
#                 "Cholesterol_Level":people.get("Cholesterol_Level")
#             },
#             "Health_risks":{
#                 "Allergies":people.get("Allergies"),
#                 "Chronic_Disease":people.get("Chronic_Disease"),
#                 "Genetic_Risk_Factor":people.get("Genetic_Risk_Factor")
#             }
#         }
#         people.pop("Blood_Pressure_Systolic", None)
#         people.pop("Blood_Pressure_Diastolic", None)
#         people.pop("BMI", None)
#         people.pop("Blood_Sugar_Level", None)
#         people.pop("Cholesterol_Level", None)
#         people.pop("Chronic_Disease", None)
#         people.pop("Genetic_Risk_Factor", None)

# def addLifeStyle():
#     for people in data:
#         people["Life Style"] = {
#             "Daily Steps":people.get("Daily_Steps"),
#             "Sleep Hours":people.get("Sleep_Hours"),
#             "Exercise Frequency":people.get("Exercise_Frequency"),
#             "Habits":{
#                 "Smoking":people.get("Smoking_Habit"),
#                 "Alcohol_Consumption":people.get("Alcohol_Consumption")
#             }

#         }
#         people.pop("Daily_Steps", None)
#         people.pop("Sleep_Hours", None)
#         people.pop("Exercise_Frequency", None)
#         people.pop("Smoking_Habit", None)
#         people.pop("Alcohol_Consumption", None)


# def addDiet():
#     for people in data:
#         people["Diet"] = {
#             "Habits":{
#                 "Dietary_Habits":people.get("Dietary_Habits"),
#                 "Preferred_Cuisine":people.get("Preferred_Cuisine"),
#                 "Food_Aversions":people.get("Food_Aversions")
#             },
#             "Intakes":{
#                 "Caloric_Intake":people.get("Caloric_Intake"),
#                 "Protein_Intake":people.get("Protein_Intake"),
#                 "Carbohydrate_Intake":people.get("Carbohydrate_Intake"),
#                 "Fat_Intake":people.get("Fat_Intake")
#             }    
#         }
#         people.pop("Dietary_Habits", None)
#         people.pop("Preferred_Cuisine", None)
#         people.pop("Food_Aversions", None)
#         people.pop("Caloric_Intake", None)
#         people.pop("Protein_Intake", None)
#         people.pop("Carbohydrate_Intake", None)
#         people.pop("Fat_Intake", None)


# def delatributes():
#     for recommendData in data:
#         recommendData.pop("Patient_ID", None)
#         recommendData.pop("Allergies", None)


#------------------------------------------------------------add location to the client data------------------------------------------
client = MongoClient("mongodb://localhost:27017")
db = client.Health_profiles

clients = db.clients   

locations = {
    "Central London": [51.490, -0.160, 51.525, -0.070],
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

def AddLocation_to_client():
        towns = list(locations.keys())
        for client in clients.find({}):
            town = random.choice(towns)
            lat_min, lng_min, lat_max, lng_max = locations[town]
            rand_x = lng_min + (lng_max - lng_min) * (random.randint(0, 100) / 100)
            rand_y = lat_min + (lat_max - lat_min) * (random.randint(0, 100) / 100)
            clients.update_one(
                { "_id" : client["_id"] },
                { "$set" : 
                    { 
                        "Personal_info.location": {
                            "town": town,
                            "type": "Point",
                            "coordinates": [rand_x, rand_y]
                        }
                }   }
            )    


AddLocation_to_client()
#delRecommendation()
#addPersonal_info()
#addHealthProfile()
#addLifeStyle()
#addDiet()
#delatributes()

# with open("Personalized_Diet.json","w") as fout:
#     json.dump(data, fout, indent=2) 
