import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Guest from '../models/Guest.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// @route   POST /api/guest/save-name
// @desc    Save guest user's name
// @access  Public
router.post('/save-name', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('guestId').notEmpty().withMessage('Guest ID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, guestId } = req.body;



    // Check if guest already exists
    let guest = await Guest.findOne({ guestId });
    
    if (guest) {
      // Update existing guest
      guest.name = name;
      guest.lastActive = new Date();
      await guest.save();
    } else {
      // Create new guest
      guest = new Guest({
        name,
        guestId
      });
      await guest.save();
    }

    res.json({
      success: true,
      guest: {
        id: guest._id,
        name: guest.name,
        guestId: guest.guestId,
        visitCount: guest.visitCount
      }
    });
  } catch (error) {
    console.error('Save guest name error:', error);
    
    // Check if it's a database connection error
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'Guest name cannot be saved without database connection. Please set up MongoDB Atlas or try again later.'
      });
    }
    
    res.status(500).json({ error: 'Server error while saving guest name' });
  }
});

// @route   GET /api/guest/:guestId
// @desc    Get guest information
// @access  Public
router.get('/:guestId', async (req, res) => {
  try {
    const { guestId } = req.params;
    

    
    const guest = await Guest.findOne({ guestId });
    
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    // Update last active time
    await guest.updateLastActive();

    res.json({
      guest: {
        id: guest._id,
        name: guest.name,
        guestId: guest.guestId,
        visitCount: guest.visitCount,
        lastActive: guest.lastActive
      }
    });
  } catch (error) {
    console.error('Get guest error:', error);
    res.status(500).json({ error: 'Server error while fetching guest' });
  }
});

// @route   PUT /api/guest/:guestId/preferences
// @desc    Update guest preferences
// @access  Public
router.put('/:guestId/preferences', [
  body('preferences').isObject().withMessage('Preferences must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { guestId } = req.params;
    const { preferences } = req.body;



    const guest = await Guest.findOne({ guestId });
    
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    // Update preferences
    guest.preferences = { ...guest.preferences, ...preferences };
    guest.lastActive = new Date();
    await guest.save();

    res.json({
      success: true,
      preferences: guest.preferences
    });
  } catch (error) {
    console.error('Update guest preferences error:', error);
    res.status(500).json({ error: 'Server error while updating preferences' });
  }
});

// @route   DELETE /api/guest/:guestId
// @desc    Delete guest data (for privacy)
// @access  Public
router.delete('/:guestId', async (req, res) => {
  try {
    const { guestId } = req.params;
    

    
    const guest = await Guest.findOneAndDelete({ guestId });
    
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json({
      success: true,
      message: 'Guest data deleted successfully'
    });
  } catch (error) {
    console.error('Delete guest error:', error);
    res.status(500).json({ error: 'Server error while deleting guest' });
  }
});

export default router; 