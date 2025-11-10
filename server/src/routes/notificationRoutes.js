const express = require('express');
const { saveSubscription } = require('../controllers/notificationController');

const router = express.Router();

// Get public VAPID key
router.get('/vapid-public-key', (req, res) => {
    const publicKey = process.env.PUBLIC_VAPID_KEY || 'BOtIvufQ6Sr9sav8KfNadOMUIQs2m7j--j4LNyYHKoGzCMyn3hC5wzdymAHQdh3HKKv1zdmYYEvFgPe9FmwH_KY';
    res.json({ publicKey });
});

// Save subscription
router.post('/', async (req, res) => {
    try {
        const subscription = req.body;
        await saveSubscription(subscription);
        res.status(201).json({ message: 'Subscription saved successfully.' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ error: 'Failed to save subscription.' });
    }
});

module.exports = router;
