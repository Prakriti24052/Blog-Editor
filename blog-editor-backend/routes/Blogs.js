
// server/routes/blogs.js
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all blogs with filtering
router.get('/', auth, [
  query('status').optional().isIn(['draft', 'published']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { author: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const blogs = await Blog.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blog by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Save as draft
router.post('/save-draft', auth, [
  body('title').optional().trim().isLength({ max: 200 }),
  body('content').optional(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title = 'Untitled', content = '', tags = [], id } = req.body;

    let blog;
    if (id) {
      // Update existing draft
      blog = await Blog.findOneAndUpdate(
        { _id: id, author: req.user._id, status: 'draft' },
        { title, content, tags, updatedAt: new Date() },
        { new: true }
      );
      
      if (!blog) {
        return res.status(404).json({ message: 'Draft not found' });
      }
    } else {
      // Create new draft
      blog = new Blog({
        title,
        content,
        tags,
        status: 'draft',
        author: req.user._id
      });
      await blog.save();
    }

    res.json({ message: 'Draft saved successfully', blog });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish blog
router.post('/publish', auth, [
  body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags = [], id } = req.body;

    let blog;
    if (id) {
      // Update and publish existing blog
      blog = await Blog.findOneAndUpdate(
        { _id: id, author: req.user._id },
        { title, content, tags, status: 'published', updatedAt: new Date() },
        { new: true }
      );
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
    } else {
      // Create and publish new blog
      blog = new Blog({
        title,
        content,
        tags,
        status: 'published',
        author: req.user._id
      });
      await blog.save();
    }

    res.json({ message: 'Blog published successfully', blog });
  } catch (error) {
    console.error('Publish blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update existing blog
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ max: 200 }),
  body('content').optional(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    console.error('Update blog error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
