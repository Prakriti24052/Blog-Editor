import React from 'react';
import { Edit3, FileText, Eye } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, blogs }) => {
  const draftCount = blogs.filter(blog => blog.status === 'draft').length;
  const publishedCount = blogs.filter(blog => blog.status === 'published').length;

  const navItems = [
    {
      id: 'editor',
      label: 'Editor',
      icon: Edit3
    },
    {
      id: 'drafts',
      label: `Drafts (${draftCount})`,
      icon: FileText
    },
    {
      id: 'published',
      label: `Published (${publishedCount})`,
      icon: Eye
    }
  ];

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} className="inline mr-2" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;