const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;
const User = require('./models/user');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/auth-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Session management
app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/auth-system' }),
}));


// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser  = await User.findOne({ username });
    if (existingUser ) {
        return res.status(400).json({ message: 'User  already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User  registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Store user info in session
    req.session.userId = user._id; // Store user ID in session
    res.json({ message: 'Login successful' });
});

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next(); // User is authenticated
    }
    res.status(401).json({ message: 'Unauthorized' }); // User is not authenticated
}

// Protected route
app.get('/profile', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) {
        return res.status(404).json({ message: 'User  not found' });
    }
    res.json(user); // Return user profile information
});

// Logout functionality
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});