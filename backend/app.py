"""
HyperCrop — Flask Application
Main entry point for the backend API.
"""

from flask import Flask
from flask_cors import CORS
from models import init_db

# Initialize database
engine, Session = init_db()


def create_app():
    app = Flask(__name__)
    CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'])

    # Register blueprints
    from routes.reports import reports_bp
    from routes.clusters import clusters_bp
    from routes.alerts import alerts_bp
    from routes.dashboard import dashboard_bp

    app.register_blueprint(reports_bp, url_prefix='/api')
    app.register_blueprint(clusters_bp, url_prefix='/api')
    app.register_blueprint(alerts_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'service': 'HyperCrop API'}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
