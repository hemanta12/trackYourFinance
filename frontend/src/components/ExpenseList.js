import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateExpense, deleteExpense, fetchExpenses } from '../redux/expensesSlice'; 
import styles from '../styles/ExpenseList.module.css';

const ExpenseList = ({ expenses = [] }) => {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    category_id: '',
    amount: '',
    payment_type_id: '',
    notes: ''
  });
  const dispatch = useDispatch();
  const categories = useSelector(state => state.lists.categories);
  const paymentTypes = useSelector(state => state.lists.paymentTypes);

  const handleEdit = (id, currentData) => {
    setEditingId(id);
    setFormData({
      date: currentData.date.split('T')[0],
      category_id: currentData.category_id,
      amount: currentData.amount,
      payment_type_id: currentData.payment_type_id,
      notes: currentData.notes || ''
    });
  };

  const saveEdit = async () => {
    if (!formData.date || !formData.category_id || !formData.amount || !formData.payment_type_id) {
      alert('All fields are required');
      return;
    }

    try {
      const updateData = {
        amount: Number(formData.amount),
        category_id: Number(formData.category_id),
        payment_type_id: Number(formData.payment_type_id),
        date: formData.date,
        notes: formData.notes || ''
      };

      await dispatch(updateExpense({
        id: editingId,
        data: updateData
      })).unwrap();
      
      setEditingId(null);
      dispatch(fetchExpenses());
    } catch (error) {
      console.error('Failed to update expense:', error);
      alert(error.response?.data?.message || 'Failed to update expense');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteExpense(id)).unwrap();
      dispatch(fetchExpenses());
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const getPaymentTypeName = (paymentTypeId) => {
    const paymentType = paymentTypes.find(p => p.id === Number(paymentTypeId));
    return paymentType ? paymentType.payment_type : 'Unknown';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === Number(categoryId));
    return category ? category.category : 'Unknown';
  };

  return (
    <div className={styles.expenseSection}>
      <h3>Expenses List:</h3>
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>Date</div>
        <div className={styles.gridHeader}>Category</div>
        <div className={styles.gridHeader}>Amount</div>
        <div className={styles.gridHeader}>Payment Type</div>
        <div className={styles.gridHeader}>Notes</div>
        <div className={styles.gridHeader}>Actions</div>
        
        {expenses.map((item) => (
          <React.Fragment key={`expense-${item.id}`}>
            {editingId === item.id ? (
              <div className={styles.gridRow}>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={styles.gridItem}
                />
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className={styles.gridItem}
                >
                  {categories.map(cat => (
                    <option key={`edit-cat-${cat.id}`} value={cat.id}>
                      {cat.category}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={styles.gridItem}
                />
                <select
                  value={formData.payment_type_id}
                  onChange={(e) => setFormData({ ...formData, payment_type_id: e.target.value })}
                  className={styles.gridItem}
                >
                  {paymentTypes.map(type => (
                    <option key={`edit-payment-${type.id}`} value={type.id}>
                      {type.payment_type}
                    </option>
                  ))}
                </select>
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
                <div className={styles.gridItem}>{getCategoryName(item.category_id)}</div>
                <div className={styles.gridItem}>${item.amount}</div>
                <div className={styles.gridItem}>{getPaymentTypeName(item.payment_type_id)}</div>
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

export default ExpenseList;
