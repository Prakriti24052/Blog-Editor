import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Send, Edit3, Clock, CheckCircle, AlertCircle, Eye, FileText, Trash2 } from 'lucide-react';
import BlogList from './BlogList';
import Navbar from './Navbar';
import Toast from './Toast';
import { useAutoSave } from '../hooks/useAutoSave';
import { blogApi } from '../services/api';

// Rich text editor component
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm"
        style={{ minHeight: '400px' }}
      />
      <div className="absolute bottom-4 right-4 text-gray-400 text-xs">
        {value.length} characters
      </div>
    </div>
  );
};

const BlogEditor = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [currentBlogId, setCurrentBlogId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const { isAutoSaving } = useAutoSave(formData, currentBlogId, setCurrentBlogId, setLastSaved, setToast, fetchBlogs);

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await blogApi.getAllBlogs();
      if (response && response.blogs) {
        setBlogs(response.blogs);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setToast({
        message: error.message || 'Failed to fetch blogs',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = async () => {
    if (!formData.title && !formData.content) {
      setToast({ 
        message: 'Please add a title or content before saving', 
        type: 'error' 
      });
      return;
    }

    try {
      setIsLoading(true);
      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
        : [];

      let response;
      if (currentBlogId) {
        response = await blogApi.updateBlog(currentBlogId, {
          title: formData.title,
          content: formData.content,
          tags
        });
      } else {
        response = await blogApi.saveDraft({
          title: formData.title,
          content: formData.content,
          tags
        });
        setCurrentBlogId(response.blog?.id);
      }

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to save draft');
      }

      setToast({ 
        message: 'Draft saved successfully', 
        type: 'success' 
      });
      setLastSaved(new Date());
      await fetchBlogs();
    } catch (error) {
      console.error('Error saving draft:', error);
      setToast({
        message: error.message || 'Failed to save draft',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.content) {
      setToast({ 
        message: 'Title and content are required for publishing', 
        type: 'error' 
      });
      return;
    }

    try {
      setIsLoading(true);
      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
        : [];

      let response;
      if (currentBlogId) {
        response = await blogApi.publishExisting(currentBlogId);
      } else {
        response = await blogApi.publishNew({
          title: formData.title,
          content: formData.content,
          tags
        });
      }

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to publish blog');
      }

      setToast({ 
        message: 'Blog published successfully', 
        type: 'success' 
      });
      setLastSaved(new Date());
      await fetchBlogs();
      
      setFormData({ title: '', content: '', tags: '' });
      setCurrentBlogId(null);
    } catch (error) {
      console.error('Error publishing blog:', error);
      setToast({
        message: error.message || 'Failed to publish blog',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBlog = (blog) => {
    if (!blog) return;
    
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      tags: (blog.tags && Array.isArray(blog.tags)) ? blog.tags.join(', ') : ''
    });
    setCurrentBlogId(blog.id);
    setActiveTab('editor');
  };

  const handleDeleteBlog = async (blogId) => {
    if (!blogId || !window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await blogApi.deleteBlog(blogId);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to delete blog');
      }

      setToast({ 
        message: 'Blog deleted successfully', 
        type: 'success' 
      });
      await fetchBlogs();
      
      if (currentBlogId === blogId) {
        setFormData({ title: '', content: '', tags: '' });
        setCurrentBlogId(null);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setToast({
        message: error.message || 'Failed to delete blog',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewBlog = () => {
    setFormData({ title: '', content: '', tags: '' });
    setCurrentBlogId(null);
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Blog Editor</h1>
            <div className="flex items-center space-x-4">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {isLoading && (
                <span className="text-sm text-blue-600 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {isAutoSaving ? 'Auto-saving...' : 'Saving...'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blogs={blogs}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Editor Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentBlogId ? 'Edit Blog' : 'Create New Blog'}
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={handleNewBlog}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  New Blog
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  <Save size={16} className="mr-2" />
                  Save Draft
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  <Send size={16} className="mr-2" />
                  Publish
                </button>
              </div>
            </div>

            {/* Editor Form */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your blog title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags <span className="text-gray-500">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="e.g., technology, programming, web development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Content Editor */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  placeholder="Start writing your blog content here..."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Draft Blogs</h2>
              <button
                onClick={handleNewBlog}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Blog
              </button>
            </div>
            <BlogList 
              blogs={blogs} 
              onEdit={handleEditBlog} 
              onDelete={handleDeleteBlog}
              type="draft" 
            />
          </div>
        )}

        {activeTab === 'published' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Published Blogs</h2>
              <button
                onClick={handleNewBlog}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Blog
              </button>
            </div>
            <BlogList 
              blogs={blogs} 
              onEdit={handleEditBlog} 
              onDelete={handleDeleteBlog}
              type="published" 
            />
          </div>
        )}
      </main>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default BlogEditor;