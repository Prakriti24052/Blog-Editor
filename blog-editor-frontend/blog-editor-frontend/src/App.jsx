import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import BlogEditor from './component/BlogEditor';
import BlogList from './component/BlogList';
import Toast from './component/Toast';

const App = () => {
  const [activeTab, setActiveTab] = useState('drafts');

  // Example data; you might load this from API
  const blogs = [
    { id: 1, title: 'First Draft', status: 'draft' },
    { id: 2, title: 'Published Post', status: 'published' }
  ];

  return (
    <Router>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} blogs={blogs} />
      <Routes>
        <Route path="/" element={<BlogList blogs={blogs} type={activeTab === 'published' ? 'published' : 'draft'} />} />
        <Route path="/editor" element={<BlogEditor />} />
      </Routes>
      <Toast />
    </Router>
  );
};

export default App;
