from flask import Flask

def create_app():
    app = Flask(__name__)
    from src.routes import main
    app.register_blueprint(main)
    return app
