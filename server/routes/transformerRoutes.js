const express = require('express');
const router = express.Router();
const {
  getTransformers,
  getTransformerById,
  createTransformer,
  updateTransformer,
  deleteTransformer,
} = require('../controllers/transformerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router
  .route('/')
  .get(protect, authorize('Admin', 'Engineer', 'Viewer'), getTransformers)
  .post(protect, authorize('Admin'), createTransformer);

router
  .route('/:id')
  .get(protect, authorize('Admin', 'Engineer', 'Viewer'), getTransformerById)
  .put(protect, authorize('Admin', 'Engineer'), updateTransformer)
  .delete(protect, authorize('Admin'), deleteTransformer);

module.exports = router;
