import sqlite3, os, random, subprocess, time, re
from flask import Flask, render_template, request, redirect, url_for, flash, session,  jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


app = Flask(__name__)
app.secret_key = 'your_secret_key'  
basedir = os.path.abspath(os.path.dirname(__file__))

# Merge all db files into one with 3 tables
APP_DB = os.path.join(basedir, 'app.db') 

hashed_pw = generate_password_hash("123")  

# Question content (intention, mood, style)
QUESTION_CONTENT = {
    "intention": {
        "title": "What brings you here?",
        "subtitle": "We’ll shape your music journey based on your intention",
        "options": [
            "I want to relax and unwind",
            "I want to explore new sounds",
            "I just want to vibe and enjoy music",
            "I want to connect with myself through sound",
            "I'm curious how music can affect my mood"
        ]
    },
    "mood": {
        "title": "How are you feeling right now?",
        "subtitle": "We use this to personalize music that matches your mood",
        "options": [
            "Happy",
            "Calm",
            "Stressed",
            "Sad",
            "Energetic",
            "I don't know"
        ]
    },
    "style": {
        "title": "Which sound feels right to you?",
        "subtitle": "We’ll shape your music journey around the vibe you choose",
        "options": [
            "Upbeat, playful rhythms",
            "Calm, contented sound",
            "Soft, rhythmic melodies",
            "Warm, reflective tones",
            "Hopeful, uplifting melodies",
            "Surprise me"
        ]
    }
}

# Quadrant mapping for moods & styles (EMOPIA)
QUADRANT_MAP = {
    "Happy": {
        "Upbeat, playful rhythms": "Q1",
        "Hopeful, uplifting melodies": "Q1",
        "Calm, contented sound": "Q4",
        "Soft, rhythmic melodies": "Q4",
    },
    "Energetic": {
        "Upbeat, playful rhythms": "Q1",
        "Hopeful, uplifting melodies": "Q1",
    },
    "Stressed": {
        "Warm, reflective tones": "Q2",
        "Soft, rhythmic melodies": "Q2"
    },
    "Sad": {
        "Warm, reflective tones": "Q3",
        "Soft, rhythmic melodies": "Q3"
    },
    "Calm": {
        "Calm, contented sound": "Q4",
        "Soft, rhythmic melodies": "Q4"
    },
    "I don't know": {
        "Surprise me": ["Q1", "Q2", "Q3", "Q4"]
    }
}

def calculate_quadrant(mood, style):
    quadrant = QUADRANT_MAP.get(mood, {}).get(style, "Q1")
    # If it's a random option (surprise me)
    if isinstance(quadrant, list):  
        quadrant = random.choice(quadrant)
    return quadrant

# Connect to 1 db file with foreign key constraints
def db_connect():
    conn = sqlite3.connect(APP_DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@app.route("/")
def index():
    return render_template("index.html", show_back_button=False)

# Authentication
@app.route("/auth", methods=["GET"])
def auth():
    if "user_id" in session:
        return redirect(url_for("question", page_type="intention"))
    return render_template("auth.html")

# Register
@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    password = request.form.get("password")
    confirm = request.form.get("confirm_password")

    if password != confirm:
        flash("Passwords do not match.")
        return redirect(url_for("auth"))

    hashed_pw = generate_password_hash(password)

    try:
        with db_connect() as conn:
            conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_pw))
        flash("Registered successfully. Please sign in.")
    except sqlite3.IntegrityError:
        flash("Username already exists.")

    return redirect(url_for("auth"))


#Login
@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")

    with db_connect() as conn:
        user = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()

    if user and check_password_hash(user["password"], password):
        session['logged_in'] = True
        session["username"] = username
        session["user_id"] = user["id"]
        return redirect(url_for("question", page_type="intention"))
    else:
        flash("Invalid username or password. Please try again.")
        return redirect(url_for("auth"))


# Guest Route
@app.route("/guest", methods=["GET"])
def guest():
    import uuid
    with db_connect() as conn:
        username = f"guest_{uuid.uuid4().hex[:8]}"
        cur = conn.execute(
            "INSERT INTO users (username, password, is_guest) VALUES (?, ?, 1)",
            (username, None)  
        )
        user_id = cur.lastrowid

    session["user_id"] = user_id  
    session["username"] = username
    session["logged_in"] = False
    return redirect(url_for("question", page_type="intention"))

#Logout
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth"))

# Question route

@app.route("/question/<page_type>")
def question(page_type):
    if "user_id" not in session:
        return redirect(url_for("auth"))

    # If page_type is invalid, redirect or show error
    if page_type not in QUESTION_CONTENT:
        return "Page not found", 404

    return render_template("question.html", data=QUESTION_CONTENT[page_type], show_back_button=True)

# Save user answers to moods.db
@app.route("/save-answer", methods=["POST"])
def save_answer():
    data = request.get_json()
    user_id = session.get("user_id")
    if not data or not user_id:
        return jsonify({"error": "Missing data"}), 400

    intention = data.get("intention")
    mood = data.get("mood")
    style = data.get("style")
    timestamp = datetime.now().isoformat()
    quadrant = calculate_quadrant(mood, style)

    with db_connect() as conn:
        conn.execute("""
            INSERT INTO user_choices (user_id, timestamp, intention, mood, style, quadrant)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, timestamp, intention, mood, style, quadrant))

    return jsonify({"message": "Saved successfully"})


# MIDI LOGIC (Get files from static > midis )
# Get midi to match mood (quadrant)
@app.route("/get-midi", methods=["GET"])
def get_midi():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 403

    with db_connect() as conn:
        row = conn.execute("""
            SELECT quadrant FROM user_choices
            WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1
        """, (user_id,)).fetchone()

    if not row:
        return jsonify({"error": "No mood data found"}), 404

    quadrant = row["quadrant"]
    midi_folder = os.path.join(app.root_path, "static", "midis")
    matching_files = [f for f in os.listdir(midi_folder) if f.startswith(f"{quadrant}__") and f.endswith(".mid")]

    if not matching_files:
        return jsonify({"error": "No MIDI files for this quadrant"}), 404

    chosen_file = random.choice(matching_files)
    return jsonify({"midi_url": f"/static/midis/{chosen_file}"})


# When user updates mood and music style
@app.route("/update-mood", methods=["POST"])
def update_mood():
    data = request.get_json()
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 403

    mood = data.get("mood")
    style = data.get("style")
    timestamp = datetime.now().isoformat()
    quadrant = calculate_quadrant(mood, style)

    with db_connect() as conn:
        conn.execute("""
            INSERT INTO user_choices (user_id, timestamp, intention, mood, style, quadrant)
            VALUES (?, ?, NULL, ?, ?, ?)
        """, (user_id, timestamp, mood, style, quadrant))

    return jsonify({"message": "Mood updated", "quadrant": quadrant})


# Main Page
@app.route("/main")
def main():
    if "user_id" not in session:
        return redirect(url_for("auth"))
    return render_template("main.html", page="main", show_user_header=True, show_back_button=True)

# AI MUSIC LOGIC

# Get the latest quadrant-based lyria mood track
@app.route('/latest-lyria', methods=['GET'])
def latest_lyria():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({'file': None})

    folder = os.path.join(app.static_folder, 'generated')

    # Only look for user-specific Lyria mood files
    pattern = f"lyria_mood_user-{user_id}_"
    wav_files = [
        f for f in os.listdir(folder)
        if f.endswith('.wav') and f.startswith(pattern)
    ]

    if not wav_files:
        return jsonify({'file': None})

    latest_file = max(
        wav_files,
        key=lambda f: os.path.getmtime(os.path.join(folder, f))
    )

    print(f"Latest Lyria file for user {user_id}: {latest_file}")
    return jsonify({'file': f'/static/generated/{latest_file}'})


# Edit lyria wav file when user changed music elements
@app.route('/edit-lyria', methods=['POST'])
def edit_lyria():
    data = request.json or {}
    genre = data.get('genre')
    instrument = data.get('instrument')
    bpm = str(data.get('bpm')) if data.get('bpm') is not None else ''
    temperature = str(data.get('temperature')) if data.get('temperature') is not None else ''
    
    # Get base prompt from session (used previously in /get-wav)
    base_prompt = session.get("base_prompt", "Dreamy Ambient Pads")

    output_dir = os.path.join('static', 'generated')
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, f"lyria_{int(time.time())}.wav")

    print(f"DEBUG PARAMETERS: {genre}, {instrument}, BPM {bpm}, temperature {temperature}, base_prompt {base_prompt}")

    subprocess.run([
        'node', 'lyriaUpdate.js',
        genre or '', instrument or '', bpm, temperature, output_file, base_prompt
    ], check=True)

    return jsonify({'newFile': f"/{output_file}"})


# Get wav route (fetch wav file from user's input)
@app.route("/get-wav", methods=["GET"])
def get_wav():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 403

    # Get latest mood + style from user
    with db_connect() as conn:
        row = conn.execute("""
            SELECT mood, style FROM user_choices
            WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1
        """, (user_id,)).fetchone()

    if not row or not row["mood"] or not row["style"]:
        return jsonify({"error": "No mood/style data found"}), 404

    mood = row["mood"].strip()
    style = row["style"].strip()

    # Handle random mood
    if mood == "I don't know":
        mood = random.choice([m for m in QUESTION_CONTENT["mood"]["options"] if m != "I don't know"])
        print(f"Random mood selected: {mood}")

    # Handle random style
    if style == "Surprise me":
        style = random.choice([s for s in QUESTION_CONTENT["style"]["options"] if s != "Surprise me"])
        print(f"Random style selected: {style}")

    # Build base prompt directly from user input
    prompt = f"{mood} mood with {style} musical textures"
    session["base_prompt"] = prompt

    # Set up file saving
    output_dir = os.path.join("static", "generated")
    os.makedirs(output_dir, exist_ok=True)
    filename = f"lyria_mood_user-{user_id}_{int(time.time())}.wav"
    output_file = os.path.join(output_dir, filename)

    print(f"Generating music with prompt: \"{prompt}\"")

    try:
        subprocess.run(
            ["node", "lyriaMood.js", prompt, output_file],
            check=True
        )
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Failed to generate WAV: {e}"}), 500

    return jsonify({"wav_url": f"/static/generated/{filename}"})

# Route to save user's feedbacks
@app.route("/submit-feedback", methods=["POST"])
def submit_feedback():
    user_id = session.get("user_id")
    if not user_id:
        user_id = session.get("guest_id")
        if not user_id:
            return jsonify({"error": "Not logged in"}), 403

    data = request.get_json()
    q1 = data.get("q1")
    q2 = data.get("q2")

    with db_connect() as conn:
        conn.execute(
            "INSERT INTO feedback (user_id, q1, q2) VALUES (?, ?, ?)",
            (user_id, q1, q2)
        )

    return jsonify({"status": "success"})


# Navigation Pages
@app.route("/profile")
def profile():
    if "user_id" not in session:
        return redirect(url_for("auth"))
    
    username = session.get("username", "Guest")
    return render_template("nav/profile.html", page="profile", username=username, show_user_header=True, show_back_button=True)

@app.route("/library")
def library():
    if "user_id" not in session:
        return redirect(url_for("auth"))
    
    return render_template("nav/library.html", page="library",  show_user_header=True, show_back_button=True)


@app.route("/settings")
def settings():
    if "user_id" not in session:
        return redirect(url_for("auth"))
    
    return render_template("nav/settings.html", page="settings", show_user_header=True, show_back_button=True)

@app.route("/share")
def share():
    if "user_id" not in session:
        return redirect(url_for("auth"))
    
    return render_template("nav/share.html", page="share",  show_user_header=True, show_back_button=True)

@app.route("/help")
def help():
    if "user_id" not in session:
        return redirect(url_for("auth"))
    
    return render_template("nav/help.html", page="help",  show_user_header=True, show_back_button=True)

