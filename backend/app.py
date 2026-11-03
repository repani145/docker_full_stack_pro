import os

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Database configuration
DB_USER = os.getenv("MYSQL_USER")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("MYSQL_DATABASE")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:3306/{DB_NAME}"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Database model
class Product(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    price = db.Column(db.Float, nullable=False)


# Health endpoint
@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


# Get all products
@app.route("/api/products", methods=["GET"])
def get_products():

    products = Product.query.all()

    result = [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price
        }
        for p in products
    ]

    return jsonify(result)


# Add product
@app.route("/api/products", methods=["POST"])
def add_product():

    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({"error": "Product name is required"}), 400

    try:
        price = float(data.get("price"))
        if price < 0:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({"error": "Valid non-negative price is required"}), 400

    product = Product(
        name=data["name"],
        price=price
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({"message": "Product added successfully"}), 201


# Delete product
@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):

    product = db.session.get(Product, product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted successfully"})


# Create database table for this practice project
with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)