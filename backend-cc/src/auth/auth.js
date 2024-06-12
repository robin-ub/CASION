const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { admin, db } = require('../middleware/firebaseAdmin');
require('dotenv').config()

const router = express.Router()
const userRef = db.ref("users");

const generateJWT = (uid) => {
    return jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const register = async (full_name, email, password) => {
    try {
        // Check if user with the provided email already exists
        const snapshot = await userRef.orderByChild('email').equalTo(email).once('value');
        if (snapshot.exists()) {
            throw new Error('Email is already registered');
        }
        
        // Hash pw
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user in the database
        const newUserRef = userRef.push();
        await newUserRef.set({
            full_name: full_name,
            email: email,
            password: hashedPassword,
            age : age,
            gender: gender
        });

        console.log(newUserRef.key)
        
        // Generate JWT token
        const token = generateJWT(newUserRef.key);
        
        return { success: true, message: "Register successful", token };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
    
// Login function
const login = async (email, password) => {
    try {
        // Find user with the provided email
        const snapshot = await userRef.orderByChild('email').equalTo(email).once('value');
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }

        // Retrieve user data
        const userData = snapshot.val(); // json array of users 
        const userId = Object.keys(userData)[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, userData[userId].password);
        if (!passwordMatch) {
            throw new Error('Incorrect password');
        }

        // Generate JWT token
        const token = generateJWT(userId);
        
        return { success: true, message: "Login successful", token };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
    

module.exports = {
    register,
    login
};