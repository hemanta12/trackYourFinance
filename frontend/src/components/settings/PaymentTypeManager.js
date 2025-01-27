import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentTypes, deletePaymentTypeThunk, updatePaymentTypeThunk } from '../../redux/listSlice';
import styles from '../../styles/Settings.module.css';

const PaymentTypeManager = () => {
  const dispatch = useDispatch();
  const paymentTypes = useSelector(state => state.lists.paymentTypes);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    dispatch(fetchPaymentTypes());
  }, [dispatch]);

  const handleEdit = (type) => {
    setEditingId(type.id);
    setEditValue(type.payment_type);
  };

  const handleSave = async (id) => {
    try {
      await dispatch(updatePaymentTypeThunk({ id, paymentType: editValue })).unwrap();
      setEditingId(null);
      dispatch(fetchPaymentTypes());
    } catch (error) {
      console.error('Failed to update payment type:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deletePaymentTypeThunk(id)).unwrap();
      dispatch(fetchPaymentTypes());
    } catch (error) {
      console.error('Failed to delete payment type:', error);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <h3>Manage Payment Types</h3>
      <div className={styles.listContainer}>
        {paymentTypes.map(type => (
          <div key={type.id} className={styles.listItem}>
            {editingId === type.id ? (
              <div className={styles.editContainer}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={styles.editInput}
                />
                <button onClick={() => handleSave(type.id)} className={styles.saveBtn}>Save</button>
                <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
              </div>
            ) : (
              <div className={styles.itemContainer}>
                <span>{type.payment_type}</span>
                <div className={styles.actions}>
                  <button onClick={() => handleEdit(type)} className={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(type.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentTypeManager;