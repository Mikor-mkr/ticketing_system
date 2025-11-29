/**
 * TICKET-DETAIL.JS - Single Ticket View & Edit Handler
 * =====================================================
 * This file handles displaying and updating a single ticket.
 * 
 * WHAT IT DOES:
 * 1. Reads the ticket ID from the URL parameters
 * 2. Fetches that specific ticket from the API
 * 3. Displays all ticket information
 * 4. Allows updating status and priority
 * 5. Handles errors (ticket not found, not authorized, etc.)
 * 
 * KEY CONCEPTS FOR JUNIOR DEVELOPERS:
 * - URL Parameters: How to read data from the URL (e.g., ?id=123)
 * - Single Resource Fetch: Getting one item by ID from an API
 * - PUT Requests: Updating existing data on the server
 * - Date Formatting: Converting dates to human-readable format
 * - Form Pre-population: Setting form values from existing data
 */


// ===========================================
// CONFIGURATION
// ===========================================
const API_BASE_URL = "http://localhost:8000";

// Store the current ticket data globally so we can access it when updating
let currentTicket = null;


// ===========================================
// DOM ELEMENT REFERENCES
// ===========================================
// Get references to the HTML elements we'll be updating

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const ticketDetail = document.getElementById("ticket-detail");
const logoutLink = document.getElementById("logout-link");

// Ticket detail elements
const ticketTitle = document.getElementById("ticket-title");
const ticketId = document.getElementById("ticket-id");
const ticketCreated = document.getElementById("ticket-created");
const ticketDescription = document.getElementById("ticket-description");

// Editable badge elements (for inline editing)
const statusBadge = document.getElementById("ticket-status-editable");
const priorityBadge = document.getElementById("ticket-priority-editable");


// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get the ticket ID from the URL
 * @returns {string|null} - The ticket ID or null if not found
 * 
 * WHAT THIS DOES:
 * Reads the URL parameters (the part after the ?)
 * Example URL: ticket-detail.html?id=123
 * This function would return "123"
 * 
 * HOW IT WORKS:
 * - window.location.search returns "?id=123"
 * - URLSearchParams parses this into key-value pairs
 * - .get("id") returns the value of the "id" parameter
 */
function getTicketIdFromUrl() {
    // URLSearchParams is a built-in browser API for parsing URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}


/**
 * Get the CSS class for a status badge
 * @param {string} status - The ticket status
 * @returns {string} - The CSS class name
 */
function getStatusBadgeClass(status) {
    const statusClasses = {
        "open": "badge-open",
        "in_progress": "badge-in-progress",
        "closed": "badge-closed"
    };
    return statusClasses[status] || "badge-open";
}


/**
 * Get the CSS class for a priority badge
 * @param {string} priority - The ticket priority
 * @returns {string} - The CSS class name
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
 * Format a date string to a human-readable format
 * @param {string} dateString - ISO date string from the API
 * @returns {string} - Formatted date like "Nov 29, 2025 at 2:30 PM"
 * 
 * WHAT THIS DOES:
 * Converts an ISO date string (2025-11-29T14:30:00) to a readable format.
 * 
 * HOW IT WORKS:
 * - new Date() creates a JavaScript Date object
 * - toLocaleDateString() formats the date part
 * - toLocaleTimeString() formats the time part
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Format options for the date
    const dateOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    // Format options for the time
    const timeOptions = { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true  // Use 12-hour format (AM/PM)
    };
    
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate} at ${formattedTime}`;
}


/**
 * Show a specific UI state
 * @param {string} state - Which state to show: "loading", "error", or "detail"
 */
function showState(state) {
    // Hide all states first
    loadingState.classList.add("hidden");
    errorState.classList.add("hidden");
    ticketDetail.classList.add("hidden");
    
    // Show the requested state
    switch (state) {
        case "loading":
            loadingState.classList.remove("hidden");
            break;
        case "error":
            errorState.classList.remove("hidden");
            break;
        case "detail":
            ticketDetail.classList.remove("hidden");
            break;
    }
}


/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    showState("error");
}


/**
 * Check if user is authenticated
 * @returns {string|null} - The access token or null if not logged in
 */
function checkAuth() {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        alert("Please log in to view tickets");
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
 * Display ticket data in the UI
 * @param {object} ticket - The ticket data from the API
 * 
 * WHAT THIS DOES:
 * Takes a ticket object and updates all the DOM elements with its data.
 * Also pre-fills the edit form with current values.
 */
function displayTicket(ticket) {
    // Store ticket data globally for later use when updating
    currentTicket = ticket;
    
    // Update the page title
    document.title = `${ticket.title} - Ticketing System`;
    
    // Update ticket title
    ticketTitle.textContent = ticket.title;
    
    // Update ticket ID
    ticketId.textContent = `#${ticket.id}`;
    
    // Update created date
    ticketCreated.textContent = formatDate(ticket.created_at);
    
    // Update description
    ticketDescription.textContent = ticket.description;
    
    // Update status badge (clickable for editing)
    updateStatusBadge(ticket.status);
    
    // Update priority badge (clickable for editing)
    updatePriorityBadge(ticket.priority);
    
    // Show the ticket detail view
    showState("detail");
}


/**
 * Update the status badge display
 * @param {string} status - The status value
 */
function updateStatusBadge(status) {
    statusBadge.textContent = formatStatus(status);
    statusBadge.className = `badge badge-editable ${getStatusBadgeClass(status)}`;
}


/**
 * Update the priority badge display
 * @param {string} priority - The priority value
 */
function updatePriorityBadge(priority) {
    priorityBadge.textContent = formatPriority(priority);
    priorityBadge.className = `badge badge-editable ${getPriorityBadgeClass(priority)}`;
}


// ===========================================
// MAIN FUNCTION - LOAD TICKET
// ===========================================

/**
 * Fetch and display a single ticket from the API
 * 
 * This is the main function that:
 * 1. Gets the ticket ID from the URL
 * 2. Validates the ID exists
 * 3. Fetches the ticket from the API
 * 4. Displays the ticket or shows an error
 */
async function loadTicket() {
    // STEP 1: Check authentication
    const token = checkAuth();
    if (!token) return;
    
    // STEP 2: Get ticket ID from URL
    const id = getTicketIdFromUrl();
    
    // STEP 3: Validate ticket ID exists
    if (!id) {
        showError("No ticket ID provided. Please select a ticket from the list.");
        return;
    }
    
    // STEP 4: Show loading state
    showState("loading");
    
    try {
        // STEP 5: Fetch the ticket from the API
        // We append the ID to the URL: /api/tickets/123
        const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        // STEP 6: Handle unauthorized response
        if (response.status === 401) {
            localStorage.removeItem("access_token");
            alert("Session expired. Please log in again.");
            window.location.href = "index.html";
            return;
        }
        
        // STEP 7: Handle not found
        if (response.status === 404) {
            showError("Ticket not found. It may have been deleted.");
            return;
        }
        
        // STEP 8: Handle other errors
        if (!response.ok) {
            throw new Error(`Failed to load ticket: ${response.status}`);
        }
        
        // STEP 9: Parse the JSON response
        const ticket = await response.json();
        
        // STEP 10: Display the ticket
        displayTicket(ticket);
        
    } catch (error) {
        // CATCH: Handle any errors
        console.error("Error loading ticket:", error);
        showError("Failed to load ticket. Please try again.");
    }
}


// ===========================================
// EVENT LISTENERS
// ===========================================

// Add logout functionality
if (logoutLink) {
    logoutLink.addEventListener("click", handleLogout);
}

// Add click handlers for inline editing
if (statusBadge) {
    statusBadge.addEventListener("click", () => showInlineEditor("status"));
}

if (priorityBadge) {
    priorityBadge.addEventListener("click", () => showInlineEditor("priority"));
}


// ===========================================
// INLINE EDITING FUNCTIONALITY
// ===========================================

/**
 * Show a toast notification
 * @param {string} message - The message to show
 * @param {string} type - "success" or "error"
 * 
 * WHAT THIS DOES:
 * Creates a small notification that slides in from the right,
 * shows the message, then disappears after a few seconds.
 */
function showToast(message, type = "success") {
    // Remove any existing toast
    const existingToast = document.querySelector(".update-toast");
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast element
    const toast = document.createElement("div");
    toast.className = `update-toast ${type}`;
    toast.textContent = message;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}


/**
 * Show an inline dropdown editor for status or priority
 * @param {string} field - Either "status" or "priority"
 * 
 * WHAT THIS DOES:
 * Replaces the badge with a dropdown selector.
 * When user selects a new value, it automatically saves.
 * 
 * KEY CONCEPT: INLINE EDITING
 * Instead of a separate form, we replace the display element
 * with an input element, then swap back after editing.
 */
function showInlineEditor(field) {
    if (!currentTicket) return;
    
    // Determine which badge and what options to use
    const badge = field === "status" ? statusBadge : priorityBadge;
    const currentValue = field === "status" ? currentTicket.status : currentTicket.priority;
    
    // Define the options for each field
    const options = field === "status" 
        ? [
            { value: "open", label: "Open" },
            { value: "in_progress", label: "In Progress" },
            { value: "closed", label: "Closed" }
        ]
        : [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" }
        ];
    
    // Create a select dropdown
    const select = document.createElement("select");
    select.className = "inline-select";
    
    // Add options to the select
    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === currentValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    // Replace the badge with the select
    badge.replaceWith(select);
    
    // Focus the select so user can immediately choose
    select.focus();
    
    // Handle selection change - auto-save when user picks a new value
    select.addEventListener("change", async () => {
        const newValue = select.value;
        await updateTicketField(field, newValue, select);
    });
    
    // Handle clicking outside or pressing Escape - cancel editing
    select.addEventListener("blur", () => {
        // Small delay to allow change event to fire first
        setTimeout(() => {
            if (document.body.contains(select)) {
                restoreBadge(field, select);
            }
        }, 150);
    });
    
    select.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            restoreBadge(field, select);
        }
    });
}


/**
 * Restore the badge after editing
 * @param {string} field - "status" or "priority"
 * @param {HTMLElement} select - The select element to replace
 */
function restoreBadge(field, select) {
    // Create a new badge element
    const badge = document.createElement("span");
    badge.id = field === "status" ? "ticket-status-editable" : "ticket-priority-editable";
    badge.title = `Click to change ${field}`;
    
    // Set the badge content and classes
    if (field === "status") {
        badge.textContent = formatStatus(currentTicket.status);
        badge.className = `badge badge-editable ${getStatusBadgeClass(currentTicket.status)}`;
        badge.addEventListener("click", () => showInlineEditor("status"));
    } else {
        badge.textContent = formatPriority(currentTicket.priority);
        badge.className = `badge badge-editable ${getPriorityBadgeClass(currentTicket.priority)}`;
        badge.addEventListener("click", () => showInlineEditor("priority"));
    }
    
    // Replace the select with the badge
    select.replaceWith(badge);
    
    // Update our reference
    if (field === "status") {
        // We need to update the reference since we created a new element
        // This is handled by using getElementById in the update function
    }
}


/**
 * Update a single field on the ticket
 * @param {string} field - "status" or "priority"
 * @param {string} newValue - The new value
 * @param {HTMLElement} select - The select element
 */
async function updateTicketField(field, newValue, select) {
    const token = localStorage.getItem("access_token");
    if (!token) {
        showToast("Session expired. Please log in again.", "error");
        window.location.href = "index.html";
        return;
    }
    
    // Check if value actually changed
    const oldValue = field === "status" ? currentTicket.status : currentTicket.priority;
    if (newValue === oldValue) {
        restoreBadge(field, select);
        return;
    }
    
    try {
        // Send PUT request to update the ticket
        const response = await fetch(`${API_BASE_URL}/api/tickets/${currentTicket.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                [field]: newValue  // Dynamic key based on field name
            })
        });
        
        if (response.status === 401) {
            localStorage.removeItem("access_token");
            showToast("Session expired", "error");
            window.location.href = "index.html";
            return;
        }
        
        if (response.status === 404) {
            showToast("You can only update your own tickets", "error");
            restoreBadge(field, select);
            return;
        }
        
        if (!response.ok) {
            throw new Error("Failed to update");
        }
        
        // Update successful - update local data
        const updatedTicket = await response.json();
        currentTicket = updatedTicket;
        
        // Restore the badge with new value
        restoreBadge(field, select);
        
        // Show success toast
        const fieldName = field === "status" ? "Status" : "Priority";
        showToast(`${fieldName} updated!`, "success");
        
    } catch (error) {
        console.error("Error updating ticket:", error);
        showToast("Failed to update. Please try again.", "error");
        restoreBadge(field, select);
    }
}


// ===========================================
// INITIALIZATION
// ===========================================

// Load the ticket when the page loads
loadTicket();
