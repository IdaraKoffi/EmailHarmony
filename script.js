// Declare a variable to store the JWT token
let token;

// Function to handle user login
async function login() {
    // Get email and password from input fields
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Send login request to the server
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Check if login was successful
        if (!response.ok) {
            throw new Error('Login failed');
        }

        // Extract token from response and store it
        const data = await response.json();
        token = data.token;

        // Display user's emails
        displayEmails();
    } catch (error) {
        console.error(error.message);
    }
}

// Function to handle user registration
async function register() {
    // Get email and password from registration form
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        // Send registration request to the server
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Check if registration was successful
        if (!response.ok) {
            throw new Error('Registration failed');
        }

        // Display success message and toggle back to login form
        alert('Registration successful. Please login.');
        toggleRegisterForm();
    } catch (error) {
        console.error(error.message);
    }
}

// Function to send an email
async function sendEmail() {
    // Get email details from compose form
    const to = document.getElementById('to').value;
    const subject = document.getElementById('subject').value;
    const body = document.getElementById('body').value;

    try {
        // Send email request to the server
        const response = await fetch('/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Attach JWT token for authorization
            },
            body: JSON.stringify({ to, subject, body })
        });

        // Check if email sending was successful
        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        // Display success message and toggle back to email compose form
        alert('Email sent successfully');
        toggleComposeForm();
    } catch (error) {
        console.error(error.message);
    }
}

// Function to search emails
async function searchEmails() {
    // Get search query from input field
    const query = document.getElementById('searchInput').value;

    try {
        // Send search request to the server
        const response = await fetch(`/emails/search?query=${query}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Attach JWT token for authorization
            }
        });

        // Check if search was successful
        if (!response.ok) {
            throw new Error('Failed to search emails');
        }

        // Display search results
        const emails = await response.json();
        displayEmails(emails);
    } catch (error) {
        console.error(error.message);
    }
}

// Function to toggle registration form visibility
async function toggleRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Function to toggle email compose form visibility
async function toggleComposeForm() {
    document.getElementById('composeForm').style.display = 'none';
    document.getElementById('to').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('body').value = '';
}

// Function to mark an email as read
async function markAsRead(emailId) {
    try {
        // Send request to mark email as read
        const response = await fetch(`/emails/${emailId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Attach JWT token for authorization
            },
            body: JSON.stringify({ read: true })
        });

        // Check if marking as read was successful
        if (!response.ok) {
            throw new Error('Failed to mark email as read');
        }

        // Update email element to indicate it has been read
        const emailElement = document.getElementById(emailId);
        emailElement.classList.remove('unread');
        emailElement.classList.add('read');
    } catch (error) {
        console.error(error.message);
    }
}

// Function to delete an email
async function deleteEmail(emailId) {
    try {
        // Send request to delete email
        const response = await fetch(`/emails/${emailId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}` // Attach JWT token for authorization
            }
        });

        // Check if deletion was successful
        if (!response.ok) {
            throw new Error('Failed to delete email');
        }

        // Remove email element from the DOM
        const emailElement = document.getElementById(emailId);
        emailElement.remove();
        document.getElementById('emailDetails').innerHTML = ''; // Clear email details
    } catch (error) {
        console.error(error.message);
    }
}

// Function to display a list of emails
async function displayEmails(emails) {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = ''; // Clear previous email list

    // Iterate over each email and create HTML elements to display them
    emails.forEach(email => {
        const emailElement = document.createElement('div');
        emailElement.id = email.id;
        emailElement.textContent = `${email.sender}: ${email.subject}`;
        emailElement.classList.add(email.read ? 'read' : 'unread');
        emailElement.onclick = () => displayEmailDetails(email);
        emailElement.oncontextmenu = (event) => showEmailContextMenu(event, email.id);
        emailList.appendChild(emailElement);
    });
}

// Function to display details of a selected email
function displayEmailDetails(email) {
    const emailDetails = document.getElementById('emailDetails');
    emailDetails.innerHTML = `
        <h2>${email.subject}</h2>
        <p>From: ${email.sender}</p>
        <p>To: ${email.recipient}</p>
        <p>${email.body}</p>
        <button onclick="deleteEmail('${email.id}')">Delete</button>
        <button onclick="markAsRead('${email.id}')">Mark as Read</button>
    `;
}

// Function to show context menu for an email
function showEmailContextMenu(event, emailId) {
    event.preventDefault();
    
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    contextMenu.innerHTML = `
        <button onclick="markAsRead('${emailId}')">Mark as Read</button>
        <button onclick="deleteEmail('${emailId}')">Delete</button>
    `;
    
    // Position context menu at the mouse cursor
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;

    // Append context menu to the body
    document.body.appendChild(contextMenu);

    // Close context menu when clicking outside of it
    document.addEventListener('click', function closeContextMenu() {
        contextMenu.remove();
        document.removeEventListener('click', closeContextMenu);
    });
}
