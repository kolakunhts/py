from flask import Flask, render_template, request, jsonify, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "supersecretkey_for_session" # ປ່ຽນເປັນຄ່າລັບໃນການໃຊ້ງານຈິງ

DB_NAME = "database.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# ໜ້າຫຼັກ
@app.route("/")
def index():
    return render_template("index.html")

# API ລົງທະບຽນ (Register)
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"success": False, "message": "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບถ້ວນ"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "ລົງທະບຽນສຳເລັດແລ້ວ! ສາມາດ Login ໄດ້"})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "ຊື່ຜູ້ໃຊ້ນີ້ມີຢູ່ແລ້ວ"}), 400

# API ເຂົ້າສູ່ລະບົບ (Login)
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[2], password):
        session["user_id"] = user[0]
        session["username"] = user[1]
        return jsonify({"success": True, "message": "ເຂົ້າສູ່ລະບົບສຳເລັດ", "username": user[1]})
    
    return jsonify({"success": False, "message": "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"}), 401

# API ອອກຈາກລະບົບ (Logout)
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "ອອກຈາກລະບົບແລ້ວ"})

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)