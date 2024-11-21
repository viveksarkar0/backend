const prisma = require("../config/db.js");
const cloudinary = require("../utils/cloudnary.js");

// Add Book
const addBook = async (req, res) => {
  try {
    const { title, author, isbn, genre, coverImage, userId } = req.body;

    // Validate input
    if (!title || !author || !isbn || !genre || !coverImage || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Upload image to Cloudinary
    let cloudinaryRes;
    try {
      cloudinaryRes = await cloudinary.uploader.upload(coverImage, {
        folder: "/cloudinary-demo",
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      return res.status(500).json({ message: "Error uploading cover image to Cloudinary" });
    }

    // Create book in database, associating it with the user via userId
    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        genre,
        userId:Number(userId),
        // coverImage
        // Directly assign userId to associate the book with the user
        coverImage: cloudinaryRes.url, // Save Cloudinary image URL
      },
    });

    res.status(201).json(book);
  } catch (error) {
    console.error("Error adding book:", error);
    // Check if the error has a message, if not, it's a generic server error
    const errorMessage = error.message || "Internal Server Error";
    res.status(500).json({ message: errorMessage });
  }
};

// Get All Books
const getAllBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: { reviews: true, user: true }, // Optionally include related data
    });

    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) }, // Ensure ID is a number
      include: { reviews: true, user: true }, // Include reviews and user for the book
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("Error fetching book by ID:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, genre, coverImage } = req.body;

    // Find existing book
    const existingBook = await prisma.book.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    let newCoverImage = existingBook.coverImage;

    // Update cover image if a new one is provided
    if (coverImage) {
      const cloudinaryRes = await cloudinary.uploader.upload(coverImage, {
        folder: "/cloudinary-demo",
      });
      newCoverImage = cloudinaryRes.url;
    }

    // Update book in database
    const updatedBook = await prisma.book.update({
      where: { id: parseInt(id) },
      data: { title, author, isbn, genre, coverImage: newCoverImage },
    });

    res.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Book
const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Start a transaction to ensure both reviews and book are deleted together
    await prisma.$transaction([
      prisma.review.deleteMany({
        where: {
          bookId: Number(id),
        },
      }),
      prisma.book.delete({
        where: {
          id: Number(id),
        },
      }),
    ]);

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({ message: "Error deleting book" });
  }
};

module.exports = { addBook, getAllBooks, getBookById, updateBook, deleteBook };
