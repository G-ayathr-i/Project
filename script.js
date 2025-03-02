// Function to update clipboard content with animation
function updateClipboardContent(data) {
    let contentDiv = document.getElementById("clipboard-container");
    let newEntry = document.createElement("p");
    newEntry.classList.add("fade-in");  // Animation

    let textContent = data.text;
    let message = document.createElement("span");

    if (data.alert) {
        message.style.color = "red";

        // Highlight only sensitive information, not the full text
        let highlightedText = textContent.replace(
            /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\d{10,})|(https?:\/\/[^\s]+)|(password|pass|pwd)/gi,
            '<span class="highlight">$&</span>'
        );

        newEntry.innerHTML = highlightedText;

        if (data.alert.includes("Email")) {
            message.textContent = "🔴 Email detected!";
        } else if (data.alert.includes("Phone")) {
            message.textContent = "🔴 Phone number detected!";
        } else if (data.alert.includes("Password")) {
            message.textContent = "🔴 Possible password detected!";
        } else if (data.alert.includes("Link")) {
            message.textContent = "🔴 Link detected!";
        }

        newEntry.appendChild(document.createElement("br"));
        newEntry.appendChild(message);

        // Add red dot alert on the tab
        document.title = "🔴 Clipboard Alert!";
    } else {
        newEntry.textContent = textContent;
    }

    contentDiv.prepend(newEntry);
}

// Function to clear clipboard content
document.getElementById("clear-btn").addEventListener("click", function() {
    document.getElementById("clipboard-container").innerHTML = "";
    document.title = "🛡️ Clipboard Monitor"; // Remove red dot alert
});

// Dark/Light Mode Toggle
document.getElementById("theme-toggle").addEventListener("click", function() {
    document.body.classList.toggle("light-mode");

    let themeBtn = document.getElementById("theme-toggle");
    if (document.body.classList.contains("light-mode")) {
        themeBtn.innerHTML = "☀️ Switch Mode";  // Change to sun
    } else {
        themeBtn.innerHTML = "🌙 Switch Mode";  // Change to moon
    }
});

// Connect to Flask-SocketIO
var socket = io.connect("http://127.0.0.1:5000");

// Listen for clipboard updates from server
socket.on("clipboard_update", function (data) {
    updateClipboardContent(data);
});

// Ensure alert is only triggered for sensitive data
document.addEventListener("copy", async () => {
    const copiedText = await navigator.clipboard.readText();

    if (containsSensitiveInfo(copiedText)) {
        alert("Sensitive information detected!");
    }
});

// Function to check for sensitive info (only alert for specific data)
function containsSensitiveInfo(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
    const phoneRegex = /\b\d{10,13}\b/;
    const urlRegex = /https?:\/\/[^\s]+/;
    const passwordRegex = /\b(password|passwd|pwd)\s*[:=]\s*\S+/i;

    return emailRegex.test(text) || phoneRegex.test(text) || urlRegex.test(text) || passwordRegex.test(text);
}

// Update clipboard container width (Double the size)
document.addEventListener("DOMContentLoaded", function() {
    let clipboardContainer = document.getElementById("clipboard-container");
    clipboardContainer.style.width = "160%"; // Doubled from 80% to 160%
});
