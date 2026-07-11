const express = require('express');
const router = express.Router();
const { getSlots, updateSlot, reorderMachines, updateMachineSettings, decommissionMachine } = require('../controllers/adminController');

// ১. ডাটাবেস থেকে সব স্লটের ডেটা তুলে আনার GET রাউট (নতুন যোগ হলো)
router.get('/slots', getSlots);

// ২. স্লটের ডেটা তৈরি বা আপডেট করার POST রাউট (আগেরটি)
router.post('/update-slot', updateSlot);

// ৩. মেশিন কার্ডগুলোর রিঅর্ডার সেভ করার PUT রাউট
router.put('/machines/reorder', reorderMachines);

// ৪. মেশিনের সেটিংস আপডেট করার PUT রাউট
router.put('/machines/:id', updateMachineSettings);

// ৫. মেশিন ডিকমিশন করার DELETE রাউট
router.delete('/machines/:id', decommissionMachine);

module.exports = router;