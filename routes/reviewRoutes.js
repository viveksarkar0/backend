const express = require('express');
const { protect } = require('../middleware/authMiddleware.js');
const { addReview, getReviewsByBook ,updateReview,deleteReview} = require('../controllers/reviewController.js');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/:bookId',protect, getReviewsByBook);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
