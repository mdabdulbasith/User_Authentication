const API_URL = 'http://localhost:3001';

// function to validate password
function validatePassword(password) {
    return password.length >= 8;
}

// Handle registration
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    // Validate password
    if (!validatePassword(password)) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error during registration:', error);
    }
});

// Handle login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            // Store user ID in local storage
            localStorage.setItem('userId', data.userId);
            displayProfile();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});

// Display user profile
function displayProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userId}`
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('profile-info').innerText = `Welcome, ${data.username}`;
            document.getElementById('registration').style.display = 'none';
            document.getElementById('login').style.display = 'none';

            document.getElementById('profile-section').style.display = 'block';
        })
        .catch(error => console.error('Error fetching profile:', error));
}

// Handle logout
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('userId');
    document.getElementById('registration').style.display = 'block';
    document.getElementById('login').style.display = 'block';
    document.getElementById('profile-section').style.display = 'none';
});

// Check if user is already logged in
window.onload = () => {
    if (localStorage.getItem('userId')) {
        displayProfile();
    }
};