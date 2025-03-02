from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS
import pyperclip
import re
import time
import threading

app = Flask(__name__)
CORS(app)  # Allow all origins
socketio = SocketIO(app, cors_allowed_origins="*")  # WebSocket Fix

# Regex patterns for detecting sensitive data
EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_REGEX = r'\b\d{10,12}\b'
URL_REGEX = r'https?://[^\s]+'  # Detects links

# Improved password detection (avoids false positives in URLs)
PASSWORD_REGEX = r'\b(password|passwd|pwd)\s*[:=]\s*[^\s]+'

def monitor_clipboard():
    """ Continuously monitor clipboard and emit updates if new content is detected. """
    last_clipboard = ""
    while True:
        content = pyperclip.paste()
        if content and content != last_clipboard:
            last_clipboard = content
            alert_type = detect_sensitive_info(content)

            socketio.emit('clipboard_update', {
                'text': content, 
                'alert': alert_type  # Only highlights, no pop-up alert
            })

        time.sleep(1)

def detect_sensitive_info(text):
    """ Detects if clipboard content contains sensitive information. """
    alerts = []

    if re.search(EMAIL_REGEX, text):
        alerts.append("Email")
    if re.search(PHONE_REGEX, text):
        alerts.append("Phone")
    if re.search(URL_REGEX, text):
        alerts.append("Link")
    
    # Ensures passwords are not falsely detected in URLs
    if re.search(PASSWORD_REGEX, text) and not re.search(URL_REGEX, text):
        alerts.append("Password")

    return ", ".join(alerts) if alerts else ""

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    # Run clipboard monitoring in a background thread
    threading.Thread(target=monitor_clipboard, daemon=True).start()
    socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
