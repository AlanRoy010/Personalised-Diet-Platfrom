from flask import Flask
from blueprints.auth.auth import auth_bp
from blueprints.users.clients import users_bp
from blueprints.users.admins import admins_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(admins_bp)



if __name__ == '__main__':
    app.run(debug=True)