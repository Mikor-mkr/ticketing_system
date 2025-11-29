/**
 * AUTH.JS - Authentication Handler
 * =================================
 * This file handles user login functionality.
 * 
 * WHAT IT DOES:
 * 1. Listens for form submission
 * 2. Sends login credentials to the API
 * 3. Saves the access token to localStorage
 * 4. Redirects to the tickets page on success
 * 
 * KEY CONCEPTS FOR JUNIOR DEVELOPERS:
 * - Event Listeners: How to respond to user actions
 * - Fetch API: How to make HTTP requests to a server
 * - Async/Await: How to handle asynchronous operations
 * - localStorage: How to store data in the browser
 * - Error Handling: How to gracefully handle failures
 */


// ===========================================
// CONFIGURATION
// ===========================================
// API base URL - change this if your backend runs on a different port
const API_BASE_URL = "http://localhost:8000";


// ===========================================
// DOM ELEMENT REFERENCES
// ===========================================
// Get references to HTML elements we need to interact with
// document.getElementById() finds an element by its "id" attribute

const loginForm = document.getElementById("login-form");
const messageElement = document.getElementById("message");


// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Display a message to the user
 * @param {string} text - The message to display
 * @param {string} type - The type of message: "success", "error", or "info"
 * 
 * WHAT THIS DOES:
 * - Updates the message paragraph's text content
 * - Adds CSS classes to style the message appropriately
 */
function showMessage(text, type = "info") {
    // Set the text content of the message element
    messageElement.textContent = text;
    
    // Remove any existing message classes
    messageElement.classList.remove("message-success", "message-error", "message-info", "hidden");
    
    // Add the appropriate class based on message type
    messageElement.classList.add(`message-${type}`);
}


/**
 * Check if user is already logged in
 * If they have a token, redirect them to tickets page
 */
function checkExistingLogin() {
    const token = localStorage.getItem("access_token");
    
    if (token) {
        // User already has a token, redirect to tickets
        window.location.href = "tickets.html";
    }
}


// ===========================================
// LOGIN FORM HANDLER
// ===========================================

/**
 * Handle login form submission
 * 
 * This function:
 * 1. Prevents the default form behavior (page refresh)
 * 2. Gets the username and password from the form
 * 3. Sends them to the /auth/login API endpoint
 * 4. Saves the returned token to localStorage
 * 5. Redirects to the tickets page
 * 
 * @param {Event} event - The form submission event
 */
async function handleLogin(event) {
    // STEP 1: Prevent default form submission
    // By default, forms refresh the page when submitted
    // We want to handle it with JavaScript instead
    event.preventDefault();
    
    // STEP 2: Get form values
    // We can access form inputs by their "name" attribute
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;
    
    // STEP 3: Validate inputs
    if (!username || !password) {
        showMessage("Please enter both username and password", "error");
        return;
    }
    
    // STEP 4: Show loading state
    showMessage("Logging in...", "info");
    
    try {
        // STEP 5: Send login request to the API
        // fetch() is the modern way to make HTTP requests
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",                           // HTTP method
            headers: {
                "Content-Type": "application/json"    // Tell server we're sending JSON
            },
            body: JSON.stringify({                    // Convert object to JSON string
                username: username,
                password: password
            })
        });
        
        // STEP 6: Check if the request was successful
        // response.ok is true if status code is 200-299
        if (!response.ok) {
            // Login failed - show error message
            if (response.status === 401) {
                showMessage("Invalid username or password", "error");
            } else {
                showMessage(`Login failed: ${response.status}`, "error");
            }
            return;
        }
        
        // STEP 7: Parse the JSON response
        // The API returns: { access_token: "...", token_type: "bearer" }
        const data = await response.json();
        
        // STEP 8: Save the token to localStorage
        // localStorage persists data even after browser is closed
        // We'll use this token for authenticated API requests
        localStorage.setItem("access_token", data.access_token);
        
        // STEP 9: Show success message briefly
        showMessage("Login successful! Redirecting...", "success");
        
        // STEP 10: Redirect to tickets page after a short delay
        setTimeout(() => {
            window.location.href = "tickets.html";
        }, 500);
        
    } catch (error) {
        // CATCH: Handle network errors or other exceptions
        // This catches errors like: server not running, network issues, etc.
        console.error("Login error:", error);
        showMessage("Connection error. Is the server running?", "error");
    }
}


// ===========================================
// EVENT LISTENERS
// ===========================================

// Listen for form submission
// When the form is submitted, call handleLogin()
loginForm.addEventListener("submit", handleLogin);


// ===========================================
// INITIALIZATION
// ===========================================

// Check if user is already logged in when page loads
checkExistingLogin();