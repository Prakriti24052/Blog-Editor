const API_BASE_URL = 'http://localhost:3001';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
};

export const blogApi = {
  // Get all blogs
  getAllBlogs: () => apiRequest('/api/blogs'),

  // Get a specific blog by ID
  getBlogById: (id) => apiRequest(`/api/blogs/${id}`),

  // Save a new draft
  saveDraft: (payload) => apiRequest('/api/blogs/save-draft', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Update an existing blog
  updateBlog: (id, payload) => apiRequest(`/api/blogs/${id}`, {
    method: 'PUT', 
    body: JSON.stringify(payload),
  }),

  // Publish a new blog
  publishNew: (payload) => apiRequest('/api/blogs/publish', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Publish an existing draft
  publishExisting: (id) => apiRequest(`/api/blogs/${id}/publish`, {
    method: 'POST',
  }),

  // Delete a blog
  deleteBlog: (id) => apiRequest(`/api/blogs/${id}`, {
    method: 'DELETE',
  }),
};