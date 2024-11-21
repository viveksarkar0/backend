const prisma = require('../config/db.js');

// Add Review
const addReview = async (req, res) => {
  try {
    const { bookId, content, rating } = req.body;

    const review = await prisma.review.create({
      data: {
        content,
        rating,
        userId: req.user.id,
        bookId: parseInt(bookId),
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Unable to add review. Please try again later.' });
  }
};

// Get Reviews for Book
const getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { bookId: parseInt(bookId) },
      include: { user: true },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Unable to fetch reviews. Please try again later.' });
  }
};


// Update Review
const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating } = req.body;

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this review' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: { content, rating },
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this review' });
    }

    await prisma.review.delete({
      where: { id: parseInt(reviewId) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

module.exports = { addReview, getReviewsByBook, updateReview, deleteReview };
