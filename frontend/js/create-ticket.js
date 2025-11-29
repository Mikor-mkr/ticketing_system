/**
 * CREATE-TICKET.JS - Ticket Creation Handler
 * ==========================================
 * This file handles creating new tickets via the API.
 * 
 * WHAT IT DOES:
 * 1. Checks if user is logged in
 * 2. Collects form data when submitted
 * 3. Sends ticket data to the API
 * 4. Shows success/error feedback to user
 * 
 * KEY CONCEPTS FOR JUNIOR DEVELOPERS:
 * - Form Handling: Getting values from form inputs
 * - POST Requests: Sending data to a server
 * - Request Headers: Including authentication tokens
 * - User Feedback: Showing loading, success, and error states
 */


// ===========================================
// CONFIGURATION
// ===========================================
const API_BASE_URL = "http://localhost:8000";


// ===========================================
// DOM ELEMENT REFERENCES
// ===========================================
// Get references to HTML elements we need to interact with

const ticketForm = document.getElementById("ticket-form");
const messageElement = document.getElementById("message");
const logoutLink = document.getElementById("logout-link");


// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Display a message to the user
 * @param {string} text - The message to display
 * @param {string} type - The type of message: "success", "error", or "info"
 */
function showMessage(text, type = "info") {
    messageElement.textContent = text;
    messageElement.classList.remove("message-success", "message-error", "message-info", "hidden");
    messageElement.classList.add(`message-${type}`);
}


/**
 * Check if user is authenticated
 * @returns {string|null} - The access token or null if not logged in
 */
function checkAuth() {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        alert("Please log in to create tickets");
        window.location.href = "index.html";
        return null;
    }
    
    return token;
}


/**
 * Handle user logout
 */
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem("access_token");
    window.location.href = "index.html";
}


/**
 * Get form data as an object
 * @returns {object} - The ticket data from the form
 * 
 * WHAT THIS DOES:
 * Reads values from form inputs and returns them as an object.
 * 
 * NOTE: We access form inputs using their "id" attribute:
 * - form.title.value gets the value of <input id="title">
 * - form.description.value gets the value of <textarea id="description">
 */
function getFormData() {
    return {
        title: ticketForm.title.value.trim(),
        description: ticketForm.description.value.trim(),
        status: ticketForm.status.value,
        priority: ticketForm.priority.value
    };
}


/**
 * Validate form data
 * @param {object} data - The ticket data to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
function validateFormData(data) {
    if (!data.title) {
        return "Please enter a title";
    }
    
    if (data.title.length < 3) {
        return "Title must be at least 3 characters";
    }
    
    if (!data.description) {
        return "Please enter a description";
    }
    
    if (data.description.length < 10) {
        return "Description must be at least 10 characters";
    }
    
    return null;  // No errors
}


// ===========================================
// MAIN FUNCTION - CREATE TICKET
// ===========================================

/**
 * Handle form submission and create a new ticket
 * 
 * This function:
 * 1. Prevents default form submission
 * 2. Validates the user is logged in
 * 3. Gets and validates form data
 * 4. Sends POST request to API
 * 5. Handles success/error responses
 * 
 * @param {Event} event - The form submission event
 */
async function handleCreateTicket(event) {
    // STEP 1: Prevent default form submission
    // Without this, the page would refresh
    event.preventDefault();
    
    // STEP 2: Check authentication
    const token = checkAuth();
    if (!token) return;
    
    // STEP 3: Get form data
    const ticketData = getFormData();
    
    // STEP 4: Validate form data
    const validationError = validateFormData(ticketData);
    if (validationError) {
        showMessage(validationError, "error");
        return;
    }
    
    // STEP 5: Show loading state
    showMessage("Creating ticket...", "info");
    
    try {
        // STEP 6: Send POST request to the API
        const response = await fetch(`${API_BASE_URL}/api/tickets/`, {
            method: "POST",              // POST = create new resource
            headers: {
                // Content-Type tells the server we're sending JSON
                "Content-Type": "application/json",
                
                // Authorization header includes our JWT token
                // The server uses this to identify who's creating the ticket
                "Authorization": `Bearer ${token}`
            },
            // Convert JavaScript object to JSON string
            body: JSON.stringify(ticketData)
        });
        
        // STEP 7: Handle unauthorized response
        if (response.status === 401) {
            localStorage.removeItem("access_token");
            alert("Session expired. Please log in again.");
            window.location.href = "index.html";
            return;
        }
        
        // STEP 8: Check for other errors
        if (!response.ok) {
            // Try to get error message from response
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || `Error: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        // STEP 9: Parse the success response
        // The API returns the created ticket object
        const createdTicket = await response.json();
        console.log("Ticket created:", createdTicket);
        
        // STEP 10: Show success message
        showMessage("Ticket created successfully!", "success");
        
        // STEP 11: Reset the form
        // This clears all input fields
        ticketForm.reset();
        
        // STEP 12: Redirect to tickets list after a short delay
        setTimeout(() => {
            window.location.href = "tickets.html";
        }, 1500);
        
    } catch (error) {
        // CATCH: Handle any errors
        console.error("Error creating ticket:", error);
        showMessage(error.message || "Failed to create ticket", "error");
    }
}


// ===========================================
// EVENT LISTENERS
// ===========================================

// Listen for form submission
ticketForm.addEventListener("submit", handleCreateTicket);

// Add logout functionality
if (logoutLink) {
    logoutLink.addEventListener("click", handleLogout);
}


// ===========================================
// INITIALIZATION
// ===========================================

// Check authentication when page loads
// This ensures only logged-in users can access this page
checkAuth();
