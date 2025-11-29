/**
 * TICKETS.JS - Tickets List Handler
 * ==================================
 * This file fetches and displays tickets from the API.
 * 
 * WHAT IT DOES:
 * 1. Checks if user is logged in (has token)
 * 2. Fetches tickets from the API
 * 3. Creates HTML elements for each ticket
 * 4. Handles loading and empty states
 * 5. Handles logout functionality
 * 
 * KEY CONCEPTS FOR JUNIOR DEVELOPERS:
 * - DOM Manipulation: Creating and inserting HTML elements with JavaScript
 * - Array Methods: Using forEach() to loop through data
 * - Template Strings: Creating dynamic HTML with backticks (``)
 * - Conditional Rendering: Showing different UI based on data
 */


// ===========================================
// CONFIGURATION
// ===========================================
const API_BASE_URL = "http://localhost:8000";


// ===========================================
// DOM ELEMENT REFERENCES
// ===========================================
// Get references to the HTML elements we'll be updating

const ticketsList = document.getElementById("tickets-list");
const loadingState = document.getElementById("loading-state");
const emptyState = document.getElementById("empty-state");
const logoutLink = document.getElementById("logout-link");


// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get the CSS class for a status badge
 * @param {string} status - The ticket status (open, in_progress, closed)
 * @returns {string} - The CSS class name for the badge
 * 
 * WHAT THIS DOES:
 * Maps status values from the API to CSS classes for styling
 */
function getStatusBadgeClass(status) {
    // Object that maps status values to CSS classes
    const statusClasses = {
        "open": "badge-open",
        "in_progress": "badge-in-progress",
        "closed": "badge-closed"
    };
    
    // Return the matching class, or "badge-open" as default
    return statusClasses[status] || "badge-open";
}


/**
 * Get the CSS class for a priority badge
 * @param {string} priority - The ticket priority (low, medium, high)
 * @returns {string} - The CSS class name for the badge
 */
function getPriorityBadgeClass(priority) {
    const priorityClasses = {
        "low": "badge-low",
        "medium": "badge-medium",
        "high": "badge-high"
    };
    
    return priorityClasses[priority] || "badge-medium";
}


/**
 * Format status text for display
 * @param {string} status - The raw status value
 * @returns {string} - Human-readable status text
 * 
 * EXAMPLE: "in_progress" -> "In Progress"
 */
function formatStatus(status) {
    const statusText = {
        "open": "Open",
        "in_progress": "In Progress",
        "closed": "Closed"
    };
    
    return statusText[status] || status;
}


/**
 * Format priority text for display
 * @param {string} priority - The raw priority value
 * @returns {string} - Human-readable priority text
 */
function formatPriority(priority) {
    const priorityText = {
        "low": "Low",
        "medium": "Medium",
        "high": "High"
    };
    
    return priorityText[priority] || priority;
}


/**
 * Create an HTML element for a single ticket
 * @param {object} ticket - The ticket data from the API
 * @returns {HTMLElement} - A <li> element representing the ticket
 * 
 * WHAT THIS DOES:
 * 1. Creates a new <li> element
 * 2. Adds CSS classes for styling
 * 3. Sets the inner HTML with ticket details
 * 4. Makes the ticket clickable (links to detail page)
 * 
 * DOM MANIPULATION CONCEPTS:
 * - document.createElement(): Creates a new HTML element
 * - element.classList.add(): Adds CSS classes to an element
 * - element.innerHTML: Sets the HTML content inside an element
 */
function createTicketElement(ticket) {
    // Step 1: Create a new <li> element
    const li = document.createElement("li");
    
    // Step 2: Add the CSS class for styling
    li.classList.add("ticket-item");
    
    // Step 3: Make the entire ticket clickable with a cursor pointer
    li.style.cursor = "pointer";
    
    // Step 4: Set the inner HTML using template literals
    // Template literals (backticks) let us:
    // - Write multi-line strings
    // - Embed variables with ${variable}
    // - Call functions with ${functionName()}
    li.innerHTML = `
        <div class="ticket-info">
            <div class="ticket-title">${ticket.title}</div>
            <div class="ticket-description" style="color: var(--text-light); font-size: 0.875rem;">
                ${ticket.description.substring(0, 100)}${ticket.description.length > 100 ? '...' : ''}
            </div>
        </div>
        <div class="ticket-meta">
            <span class="badge ${getStatusBadgeClass(ticket.status)}">
                ${formatStatus(ticket.status)}
            </span>
            <span class="badge ${getPriorityBadgeClass(ticket.priority)}">
                ${formatPriority(ticket.priority)}
            </span>
        </div>
    `;
    
    // Step 5: Add click event to navigate to ticket detail page
    // When the user clicks on this ticket, they go to the detail page
    // The ticket ID is passed as a URL parameter: ?id=123
    li.addEventListener("click", () => {
        window.location.href = `ticket-detail.html?id=${ticket.id}`;
    });
    
    // Step 6: Return the created element
    return li;
}


/**
 * Show or hide UI states
 * @param {string} state - Which state to show: "loading", "empty", or "list"
 */
function showState(state) {
    // Hide all states first
    loadingState.classList.add("hidden");
    emptyState.classList.add("hidden");
    ticketsList.classList.add("hidden");
    
    // Show the requested state
    switch (state) {
        case "loading":
            loadingState.classList.remove("hidden");
            break;
        case "empty":
            emptyState.classList.remove("hidden");
            break;
        case "list":
            ticketsList.classList.remove("hidden");
            break;
    }
}


/**
 * Check if user is authenticated
 * @returns {string|null} - The access token or null if not logged in
 * 
 * If user is not logged in, redirects to login page
 */
function checkAuth() {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        // No token found - user is not logged in
        // Redirect to login page
        alert("Please log in to view tickets");
        window.location.href = "index.html";
        return null;
    }
    
    return token;
}


/**
 * Handle user logout
 * 
 * WHAT THIS DOES:
 * 1. Removes the access token from localStorage
 * 2. Redirects to the login page
 */
function handleLogout(event) {
    // Prevent the default link behavior
    event.preventDefault();
    
    // Remove the token from localStorage
    localStorage.removeItem("access_token");
    
    // Redirect to login page
    window.location.href = "index.html";
}


// ===========================================
// MAIN FUNCTION - LOAD TICKETS
// ===========================================

/**
 * Fetch and display tickets from the API
 * 
 * This is the main function that:
 * 1. Checks authentication
 * 2. Shows loading state
 * 3. Fetches tickets from API
 * 4. Creates HTML for each ticket
 * 5. Handles errors appropriately
 */
async function loadTickets() {
    // STEP 1: Check if user is logged in
    const token = checkAuth();
    if (!token) return;  // checkAuth will redirect if not logged in
    
    // STEP 2: Show loading state
    showState("loading");
    
    try {
        // STEP 3: Fetch tickets from the API
        // We include the Authorization header with our token
        const response = await fetch(`${API_BASE_URL}/api/tickets/`, {
            method: "GET",
            headers: {
                // Bearer token authentication
                // The server uses this to identify the user
                "Authorization": `Bearer ${token}`
            }
        });
        
        // STEP 4: Handle unauthorized response
        if (response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem("access_token");
            alert("Session expired. Please log in again.");
            window.location.href = "index.html";
            return;
        }
        
        // STEP 5: Check for other errors
        if (!response.ok) {
            throw new Error(`Failed to fetch tickets: ${response.status}`);
        }
        
        // STEP 6: Parse the JSON response
        // The API returns an array of ticket objects
        const tickets = await response.json();
        
        // STEP 7: Check if there are any tickets
        if (tickets.length === 0) {
            showState("empty");
            return;
        }
        
        // STEP 8: Clear any existing tickets in the list
        ticketsList.innerHTML = "";
        
        // STEP 9: Create and append elements for each ticket
        // forEach() loops through each item in the array
        tickets.forEach(ticket => {
            // Create a ticket element
            const ticketElement = createTicketElement(ticket);
            
            // Append it to the list
            // appendChild() adds an element as the last child
            ticketsList.appendChild(ticketElement);
        });
        
        // STEP 10: Show the tickets list
        showState("list");
        
    } catch (error) {
        // CATCH: Handle any errors
        console.error("Error loading tickets:", error);
        
        // Show an error message to the user
        ticketsList.innerHTML = `
            <li class="ticket-item" style="justify-content: center; color: var(--danger-color);">
                Error loading tickets. Please try again.
            </li>
        `;
        showState("list");
    }
}


// ===========================================
// EVENT LISTENERS
// ===========================================

// Add logout functionality
if (logoutLink) {
    logoutLink.addEventListener("click", handleLogout);
}


// ===========================================
// INITIALIZATION
// ===========================================

// Load tickets when the page loads
// This is called immediately when the script runs
loadTickets();
