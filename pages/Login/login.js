
// Function to switch between Sign In and Sign Up tabs
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.form-section');

    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');

    clearAlerts();
}

// Toggle password visibility
function togglePassword(inputId) {
    event.preventDefault();
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Show alert message
function showAlert(message, type) {
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');

    if (type === 'error') {
        alertError.textContent = message;
        alertError.classList.add('show');
    } else {
        alertSuccess.textContent = message;
        alertSuccess.classList.add('show');
    }
}

// Clear all alerts
function clearAlerts() {
    document.getElementById('alertError').classList.remove('show');
    document.getElementById('alertSuccess').classList.remove('show');
}

// Handle Sign Up
function handleSignUp(event) {
    event.preventDefault();
    clearAlerts();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }

    // Get existing users from localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showAlert('This email is already registered. Please use Sign In', 'error');
        return;
    }

    // Create new user
    const newUser = {
        name: name,
        email: email,
        password: password,
        joinDate: new Date().toLocaleDateString()
    };

    // Save user to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Show success message
    showAlert('Account created successfully! You can now sign in', 'success');

    // Reset form
    document.getElementById('signupForm').reset();

    // Switch to sign in tab after 2 seconds
    setTimeout(() => {
        switchTab('signin');
    }, 2000);
}

// Handle Sign In
function handleSignIn(event) {
    event.preventDefault();
    clearAlerts();

    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;

    // Validation
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    // Get users from localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showAlert('Invalid email or password', 'error');
        return;
    }

    // Save logged in user to sessionStorage
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    // Show success message
    showAlert('Login successful! Redirecting...', 'success');

    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
        showDashboard();
    }, 1500);
}

// Show dashboard
function showDashboard() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        showAuthPage();
        return;
    }

    // Hide auth page and show dashboard
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboardContainer').classList.add('active');

    // Display user information
    document.getElementById('displayName').textContent = loggedInUser.name;
    document.getElementById('displayEmail').textContent = loggedInUser.email;
    document.getElementById('avatarInitial').textContent = loggedInUser.name.charAt(0).toUpperCase();

    document.getElementById('detailName').textContent = loggedInUser.name;
    document.getElementById('detailEmail').textContent = loggedInUser.email;
    document.getElementById('detailJoinDate').textContent = loggedInUser.joinDate;
}

// Show auth page
function showAuthPage() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('dashboardContainer').classList.remove('active');
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('loggedInUser');
    document.getElementById('signinForm').reset();
    showAuthPage();
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        showDashboard();
    }
});
