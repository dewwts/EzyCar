const express = require('express');
const{
    getProviders,
    getProvider,
    createProvider,
    updateProvider,
    deleteProvider
} = require('../controllers/providers')

const router = express.Router();
const {protect, authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, getProviders)
    .post(protect, authorize('admin'), createProvider);

router.route('/:id')
    .get(protect, getProvider)
    .put(protect, authorize('admin'), updateProvider)
    .delete(protect, authorize('admin'), deleteProvider)

module.exports = router;