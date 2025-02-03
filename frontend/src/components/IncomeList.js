import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateIncome, deleteIncome, fetchIncome } from "../redux/incomeSlice";
import { fetchSources } from "../redux/listSlice";
import styles from "../styles/IncomeList.module.css";

const IncomeList = ({ income = [] }) => {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    source_id: "",
    amount: "",
    notes: "",
  });
  const dispatch = useDispatch();
  const sources = useSelector((state) => state.lists.sources);

  useEffect(() => {
    dispatch(fetchSources());
    dispatch(fetchIncome());
  }, [dispatch]);

  const getSourceName = (sourceId) => {
    // Convert sourceId to number for strict comparison
    const source = sources.find((s) => s.id === Number(sourceId));
    return source ? source.source : "Unknown";
  };

  const handleEdit = (id, currentData) => {
    setEditingId(id);
    setFormData({
      date: currentData.date.split("T")[0],
      source_id: currentData.source_id,
      amount: currentData.amount,
      notes: currentData.notes || "",
    });
  };

  const saveEdit = async () => {
    if (!formData.date || !formData.source_id || !formData.amount) {
      alert("All fields are required");
      return;
    }

    try {
      const updateData = {
        amount: Number(formData.amount),
        source_id: Number(formData.source_id),
        date: formData.date,
        notes: formData.notes || "",
      };

      await dispatch(
        updateIncome({
          id: editingId,
          data: updateData,
        })
      ).unwrap();

      setEditingId(null);
      dispatch(fetchIncome());
    } catch (error) {
      console.error("Failed to update income:", error);
      alert(error.response?.data?.message || "Failed to update income");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteIncome(id)).unwrap();
      dispatch(fetchIncome());
    } catch (error) {
      console.error("Failed to delete income:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  return (
    <div className={styles.incomeSection}>
      <h2 className={styles.title}>Income List</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.incomeTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {income.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <tr
                  key={`income-${item.id}`}
                  className={isEditing ? styles.editingRow : ""}
                >
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className={styles.editField}
                      />
                    ) : (
                      formatDate(item.date)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={formData.source_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            source_id: e.target.value,
                          })
                        }
                        className={styles.editField}
                      >
                        {sources.map((source) => (
                          <option key={`source-${source.id}`} value={source.id}>
                            {source.source}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getSourceName(item.source_id)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        className={styles.editField}
                      />
                    ) : (
                      `$${item.amount}`
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className={styles.editField}
                      />
                    ) : (
                      item.notes || "-"
                    )}
                  </td>
                  <td className={styles.actionCell}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className={styles.saveButton}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(item.id, item)}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeList;
