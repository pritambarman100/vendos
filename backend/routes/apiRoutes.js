const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Vending Machine Chambers (Slots) Endpoints
router.get('/slots', apiController.getSlots);
router.post('/slots/save', apiController.saveSlot);
router.post('/slots/delete/:slot_id', apiController.deleteSlot);
router.delete('/slots/delete/:slot_id', apiController.deleteSlot);

// Vending Stats & Sales Logs Endpoints
router.get('/dashboard/stats', apiController.getDashboardStats);
router.get('/sales', apiController.getSales);

// Customer Transaction Endpoint
router.post('/transactions/process', apiController.processTransaction);

// Hardware polling Endpoint
router.get('/hardware/dispense-queue', apiController.getDispenseQueue);

// System Reset Endpoint
router.post('/system/reset', apiController.resetSystem);

// Vending Machine Entity Endpoints
router.get('/machines', apiController.getMachines);
router.post('/machines/save', apiController.saveMachine);
router.post('/machines/delete/:machine_id', apiController.deleteMachine);
router.delete('/machines/delete/:machine_id', apiController.deleteMachine);

module.exports = router;
