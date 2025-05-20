import React from 'react';
import { Edit3, Trash2, FileText } from 'lucide-react';

const BlogList = ({ blogs, onEdit, onDelete, type }) => {
  const filteredBlogs = blogs.filter(blog => blog.status === type);

  if (filteredBlogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">No {type}s found</p>
        <p className="text-sm">
          {type === 'draft' 
            ? 'Start writing and save your first draft!' 
            : 'Publish your first blog to see it here!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredBlogs.map((blog) => (
        <div 
          key={blog.id} 
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {blog.title || 'Untitled'}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {blog.content 
                  ? blog.content.substring(0, 200) + (blog.content.length > 200 ? '...' : '')
                  : 'No content'
                }
              </p>
              <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  Created: {new Date(blog.created_at).toLocaleDateString()}
                </span>
                <span>
                  Updated: {new Date(blog.updated_at).toLocaleDateString()}
                </span>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {blog.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onEdit(blog)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit blog"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => onDelete(blog.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete blog"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogList;