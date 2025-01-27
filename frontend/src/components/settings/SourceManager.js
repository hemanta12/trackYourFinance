import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSources, deleteSourceThunk, updateSourceThunk } from '../../redux/listSlice';
import styles from '../../styles/Settings.module.css';

const SourceManager = () => {
  const dispatch = useDispatch();
  const sources = useSelector(state => state.lists.sources);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    dispatch(fetchSources());
  }, [dispatch]);

  const handleEdit = (source) => {
    setEditingId(source.id);
    setEditValue(source.source);
  };

  const handleSave = async (id) => {
    try {
      await dispatch(updateSourceThunk({ id, source: editValue })).unwrap();
      setEditingId(null);
      dispatch(fetchSources());
    } catch (error) {
      console.error('Failed to update source:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSourceThunk(id)).unwrap();
      dispatch(fetchSources());
    } catch (error) {
      console.error('Failed to delete source:', error);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <h3>Manage Sources</h3>
      <div className={styles.listContainer}>
        {sources.map(source => (
          <div key={source.id} className={styles.listItem}>
            {editingId === source.id ? (
              <div className={styles.editContainer}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={styles.editInput}
                />
                <button onClick={() => handleSave(source.id)} className={styles.saveBtn}>Save</button>
                <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
              </div>
            ) : (
              <div className={styles.itemContainer}>
                <span>{source.source}</span>
                <div className={styles.actions}>
                  <button onClick={() => handleEdit(source)} className={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(source.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceManager;