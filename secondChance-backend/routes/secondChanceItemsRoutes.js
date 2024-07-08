const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        const dbInstance = await connectToDatabase()
        const collection = dbInstance.collection('secondChanceItems')
        console.log(collection)
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (error) {
        logger.console.error('oops something went wrong', error)
        next(error);
    }
});

// Add a new item
router.post('/', upload.single('file'), async(req, res,next) => {
    try {
        const dbInstance = await connectToDatabase()
        const collection = dbInstance.collection('secondChanceItems')

        let secondChanceItem = req.body
        const lastItemID = await collection.findOne({}, {sort: {'id': -1}, projection: {_id: 0, id: 1}})
        secondChanceItem.id = lastItemID + 1
        secondChanceItem.created_at = new Date()
        secondChanceItem = await collection.insertOne(secondChanceItem)
        
        res.status(201).json(secondChanceItem.ops[0]);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        const dbInstance = await connectToDatabase()
        const collection = dbInstance.collection('secondChanceItems')
        const {id} = req.params
        const secondChanceItem = collection.findOne({id})
        if (!secondChanceItem) return res.status(404).json({message: `Item with id ${id} not found`})
        res.json(secondChanceItem)
    } catch (error) {
        next(error);
    }
});

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        const dbInstance = await connectToDatabase()
        const collection = dbInstance.collection('secondChanceItems')

        const {id} = req.params

        const secondChanceItem = collection.findOne({id})
        if (!secondChanceItem) return res.status(404).json({message: `Item with id ${id} not found`})

        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days/365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );

        res.status(200).json(secondChanceItem)
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        const dbInstance = await connectToDatabase()
        const collection = dbInstance.collection('secondChanceItems')

        const {id} = req.params
        
        const result = await collection.deleteOne({ id: itemId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        return res.status(200).json({message: 'Item deleted successfully'})
    } catch (e) {
        next(e);
    }
});

module.exports = router;
