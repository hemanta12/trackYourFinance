import React, {useState} from 'react';
import { useDispatch } from 'react-redux';
import { updateIncome, deleteIncome } from '../redux/incomeSlice';
import styles from '../styles/IncomeList.module.css';

const IncomeList = ({ income = [] }) => {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ source: '',amount: '',  date: '' });
  const dispatch = useDispatch();

  const handleEdit = (id, currentData) => {
    setEditingId(id);
    setFormData(currentData);
  };

  const saveEdit = () => {
    if (!formData.date || !formData.source || !formData.amount) {
      alert('All fields are required');
      return;
    }
    dispatch(updateIncome({ id: editingId, data: formData }));
    setEditingId(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteIncome(id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
        <div className={styles.gridHeader}>Actions</div>
        {income.map((item) => (
          <React.Fragment key={item.id}>
             {editingId === item.id ? (
              <>
               <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`${styles.gridItem} ${styles.editField}`}
                />
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className={`${styles.gridItem} ${styles.editField}`}
                  />
              <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`${styles.gridItem} ${styles.editField}`}
                />
                <div className={styles.actionButtons}>
                  <button onClick={saveEdit} className={styles.saveButton}>Save</button>
                  <button onClick={() => setEditingId(null)} className={styles.cancelButton}>Cancel</button>
                </div>
              </>
             ): (
              <>
               <div className={styles.gridItem}>{formatDate(item.date)}</div>
               <div className={styles.gridItem}>{item.source}</div>
               <div className={styles.gridItem}>${item.amount}</div>
               <div className={styles.actionButtons}>
                  <button onClick={() => handleEdit(item.id, item)} className={styles.editButton}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>Delete</button>
                </div>

              </>

             )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
