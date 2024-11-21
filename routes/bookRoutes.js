const express = require('express');
const { protect } = require('../middleware/authMiddleware.js');
const { addBook, getAllBooks, updateBook, deleteBook,getBookById } = require('../controllers/bookController.js')

const router = express.Router();

router.get('/', getAllBooks);
router.post('/', protect, addBook);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);
router.get('/books/:id', getBookById);

module.exports = router;
