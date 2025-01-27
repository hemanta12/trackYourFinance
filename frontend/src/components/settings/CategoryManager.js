import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, updateCategoryThunk, deleteCategoryThunk } from '../../redux/listSlice';
import styles from '../../styles/Settings.module.css';

const CategoryManager = () => {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.lists.categories);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditValue(category.category);
  };

  const handleSave = async (id) => {
    try {
      await dispatch(updateCategoryThunk({ id, category: editValue })).unwrap();
      setEditingId(null);
      dispatch(fetchCategories());
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCategoryThunk(id)).unwrap();
      dispatch(fetchCategories());
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Cannot delete system default items');
      } else {
        console.error('Failed to delete category:', error);
      }
    }
  };

  return (
    <div className={styles.managerContainer}>
      <h3>Manage Categories</h3>
      <div className={styles.listContainer}>
        {categories.map(category => (
          <div key={category.id} className={styles.listItem}>
            {editingId === category.id ? (
              <div className={styles.editContainer}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={styles.editInput}
                />
                <button onClick={() => handleSave(category.id)} className={styles.saveBtn}>
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className={styles.itemContainer}>
                <span>{category.category}</span>
                <div className={styles.actions}>
                  <button onClick={() => handleEdit(category)} className={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(category.id)} className={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;