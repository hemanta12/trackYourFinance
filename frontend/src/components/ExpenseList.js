import React, {useState} from 'react';
import { useDispatch } from 'react-redux';
import { updateExpense, deleteExpense } from '../redux/expensesSlice'; 
import styles from '../styles/ExpenseList.module.css';

const ExpenseList = ({ expenses = [] }) => {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', category: '', amount: '', payment_type: '' });
  const dispatch = useDispatch();

  const handleEdit = (id, currentData) => {
    setEditingId(id);
    setFormData(currentData);
  };

  const saveEdit = () => {
    if (!formData.date || !formData.category || !formData.amount || !formData.payment_type) {
      alert('All fields are required');
      return;
    }
    dispatch(updateExpense({ id: editingId, data: formData }));
    setEditingId(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteExpense(id));
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };


  return (
    <div className={styles.expenseSection}>
      <h3>Expenses List:</h3>
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>Date</div>
        <div className={styles.gridHeader}>Category</div>
        <div className={styles.gridHeader}>Amount</div>
        <div className={styles.gridHeader}>Payment Type</div>
        <div className={styles.gridHeader}>Actions</div>
        {expenses.map((item) => (
          <React.Fragment key={item.id}>
              {editingId === item.id ? (
              <>
                  <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={styles.gridItem}
                />
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={styles.gridItem}
                />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={styles.gridItem}
                />
                <input
                  type="text"
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  className={styles.gridItem}
                />
                <div className={styles.actionButtons}>
                  <button onClick={saveEdit} className={styles.saveButton}>Save</button>
                  <button onClick={() => setEditingId(null)} className={styles.cancelButton}>Cancel</button>
                </div>
              </>
              ): (
                <>
                  <div className={styles.gridItem}>{formatDate(item.date)}</div>
                  <div className={styles.gridItem}>{item.category}</div>
                  <div className={styles.gridItem}>${item.amount}</div>
                  <div className={styles.gridItem}>{item.payment_type}</div>
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

export default ExpenseList;
