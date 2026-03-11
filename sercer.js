const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const protect = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send("Access Denied");

    try {
        const verified = jwt.verify(token.split(" ")[1], 'YOUR_SECRET_KEY');
        req.user = verified;
        next(); // Let them through!
    } catch (err) {
        res.status(400).send("Invalid Token");
    }
};

// Protect the 'Add Recipe' route
app.post('/api/recipes', protect, async (req, res) => {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).send("Recipe added successfully by Admin!");
});



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Register Route (Create an Admin)
app.post('/api/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ email: req.body.email, password: hashedPassword });
    await newUser.save();
    res.status(201).send("Admin Created");
});

// Login Route (Get the Token)
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
        return res.status(401).send("Invalid credentials");
    }
    const token = jwt.sign({ userId: user._id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
    res.json({ token });
});
// Middleware
app.use(express.json());
app.use(cors());

// 1. Connect to MongoDB (Database)
mongoose.connect('mongodb://localhost:27017/flavorFeast')
    .then(() => console.log("Connected to Food Database"))
    .catch(err => console.error("Connection failed", err));

// 2. Define a Recipe "Schema" (The blueprint for a recipe)
const recipeSchema = new mongoose.Schema({
    title: String,
    category: String,
    prepTime: Number,
    ingredients: [String],
    image: String
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// 3. API Routes
// GET all recipes
app.get('/api/recipes', async (req, res) => {
    const recipes = await Recipe.find();
    res.json(recipes);
});

// POST a new recipe (Add food to your site)
app.post('/api/recipes', async (req, res) => {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).send("Recipe added!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));