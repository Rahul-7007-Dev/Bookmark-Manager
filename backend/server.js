const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Bookmark = require("./models/Bookmark");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Bookmark Manager API is running!",
  });
});

app.post("/api/bookmarks", async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title?.trim() || !url?.trim()) {
      return res.status(400).json({
        message: "Title and URL are required",
      });
    }

    const bookmark = await Bookmark.create({
      title,
      url,
    });

    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create bookmark",
    });
  }
});

app.get("/api/bookmarks", async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().sort({
      createdAt: -1,
    });

    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookmarks",
    });
  }
});

app.patch("/api/bookmarks/:id", async (req, res) => {
  try {
    const { title, url } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        message: "Title cannot be empty",
      });
    }

    if (url !== undefined && !url.trim()) {
      return res.status(400).json({
        message: "URL cannot be empty",
      });
    }

    const bookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(url !== undefined && { url: url.trim() }),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!bookmark) {
      return res.status(404).json({
        message: "Bookmark not found",
      });
    }

    res.status(200).json(bookmark);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid bookmark ID",
      });
    }

    res.status(500).json({
      message: "Failed to update bookmark",
    });
  }
});

app.delete("/api/bookmarks/:id", async (req, res) => {
  try {
    const bookmark = await Bookmark.findByIdAndDelete(req.params.id);

    if (!bookmark) {
      return res.status(404).json({
        message: "Bookmark not found",
      });
    }

    res.status(200).json({
      message: "Bookmark deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid bookmark ID",
      });
    }

    res.status(500).json({
      message: "Failed to delete bookmark",
    });
  }
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
