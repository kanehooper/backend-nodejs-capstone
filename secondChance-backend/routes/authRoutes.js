const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {
    try {
        
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = connectRoDatabase()

        // Task 2: Access MongoDB `users` collection
        const collection = db.collection('users')
        // Task 3: Check if user credentials already exists in the database and throw an error if they do
        const user = await collection.findOne({email: req.body.email})

        if (user) {
            logger.error('User already exists')
            return res.status(400).json({message: 'Email id already exists'})
        }

        // Task 4: Create a hash to encrypt the password so that it is not readable in the database
        const salt = await bcrypt.genSalt(12)
        const hash = await bcrypt.hash(req.body.password, salt)

        // Task 5: Insert the user into the database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date()
        })

        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = {
            user: {id: newUser.insertedId}
        }

        const authToken = jwt.sign(payload, JWT_SECRET)

        // Task 7: Log the successful registration using the logger
        logger.info('New user successfully registered')

        // Task 8: Return the user email and the token as a JSON        
        res.status(201).json({userEmail: req.body.email, authToken})
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'})    
    }
})