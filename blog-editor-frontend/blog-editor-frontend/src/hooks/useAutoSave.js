import { useEffect, useRef, useCallback } from 'react';
import { blogApi } from '../services/api';
import { debounce } from '../utils/debounce';

export const useAutoSave = (
  formData, 
  currentBlogId, 
  setCurrentBlogId, 
  setLastSaved, 
  setToast,
  fetchBlogs
) => {
  const lastFormDataRef = useRef(formData);
  const isAutoSavingRef = useRef(false);

  // Auto-save function
  const autoSave = useCallback(async () => {
    // Don't auto-save if already saving or no content
    if (isAutoSavingRef.current || (!formData.title && !formData.content)) {
      return;
    }

    // Check if form data has actually changed
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(lastFormDataRef.current);
    if (!hasChanged) return;

    isAutoSavingRef.current = true;
    
    try {
      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
        : [];
      
      const payload = {
        title: formData.title,
        content: formData.content,
        tags
      };

      let response;
      if (currentBlogId) {
        response = await blogApi.updateBlog(currentBlogId, payload);
      } else {
        response = await blogApi.saveDraft(payload);
        setCurrentBlogId(response.blog.id);
      }

      lastFormDataRef.current = { ...formData };
      setLastSaved(new Date());
      setToast({ message: 'Draft auto-saved', type: 'info' });
      fetchBlogs();
    } catch (error) {
      console.error('Auto-save error:', error);
      setToast({ message: 'Auto-save failed', type: 'error' });
    } finally {
      isAutoSavingRef.current = false;
    }
  }, [formData, currentBlogId, setCurrentBlogId, setLastSaved, setToast, fetchBlogs]);

  // Create debounced auto-save function
  const debouncedAutoSave = useCallback(
    debounce(autoSave, 5000), // Auto-save after 5 seconds of inactivity
    [autoSave]
  );

  // Effect to trigger auto-save when form data changes
  useEffect(() => {
    debouncedAutoSave();
  }, [formData, debouncedAutoSave]);

  // Update ref when formData changes externally (e.g., when editing existing blog)
  useEffect(() => {
    lastFormDataRef.current = formData;
  }, [formData.title, formData.content, formData.tags]);

  return {
    isAutoSaving: isAutoSavingRef.current
  };
};