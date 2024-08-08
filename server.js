const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => { console.log("Database connected") })
    .catch((err) => { console.log("Error", err) });

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});