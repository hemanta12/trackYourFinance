import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateIncome, deleteIncome, fetchIncome } from '../redux/incomeSlice';
import styles from '../styles/IncomeList.module.css';

const IncomeList = ({ income = [] }) => {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    source_id: '',
    amount: '',
    notes: ''
  });
  const dispatch = useDispatch();
  const sources = useSelector(state => state.lists.sources);

  const getSourceName = (sourceId) => {
    // Convert sourceId to number for strict comparison
    const source = sources.find(s => s.id === Number(sourceId));
    return source ? source.source : 'Unknown';
  };

  const handleEdit = (id, currentData) => {
    setEditingId(id);
    setFormData({
      date: currentData.date.split('T')[0],
      source_id: currentData.source_id,
      amount: currentData.amount,
      notes: currentData.notes || ''
    });
  };

  const saveEdit = async () => {
    if (!formData.date || !formData.source_id || !formData.amount) {
      alert('All fields are required');
      return;
    }

    try {
      const updateData = {
        amount: Number(formData.amount),
        source_id: Number(formData.source_id),
        date: formData.date,
        notes: formData.notes || ''
      };

      await dispatch(updateIncome({
        id: editingId,
        data: updateData
      })).unwrap();
      
      setEditingId(null);
      dispatch(fetchIncome());
    } catch (error) {
      console.error('Failed to update income:', error);
      alert(error.response?.data?.message || 'Failed to update income');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteIncome(id)).unwrap();
      dispatch(fetchIncome());
    } catch (error) {
      console.error('Failed to delete income:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  return (
    <div className={styles.incomeSection}>
      <h3>Income List:</h3>
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>Date</div>
        <div className={styles.gridHeader}>Source</div>
        <div className={styles.gridHeader}>Amount</div>
        <div className={styles.gridHeader}>Notes</div>
        <div className={styles.gridHeader}>Actions</div>
        
        {income.map((item) => (
          <React.Fragment key={`income-${item.id}`}>
            {editingId === item.id ? (
              <div className={styles.gridRow}>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={styles.gridItem}
                />
                <select
                  value={formData.source_id}
                  onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
                  className={styles.gridItem}
                >
                  {sources.map(src => (
                    <option key={`edit-source-${src.id}`} value={src.id}>
                      {src.source}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={styles.gridItem}
                />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={styles.gridItem}
                />
                <div className={styles.actionButtons}>
                  <button onClick={saveEdit} className={styles.saveButton}>Save</button>
                  <button onClick={() => setEditingId(null)} className={styles.cancelButton}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className={styles.gridRow}>
                <div className={styles.gridItem}>{formatDate(item.date)}</div>
                <div className={styles.gridItem}>{getSourceName(item.source_id)}</div>
                <div className={styles.gridItem}>${item.amount}</div>
                <div className={styles.gridItem}>{item.notes || '-'}</div>
                <div className={styles.actionButtons}>
                  <button onClick={() => handleEdit(item.id, item)} className={styles.editButton}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>Delete</button>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
