import React from "react";
import Button from "../common/Button";
import {
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaToggleOff,
  FaToggleOn,
} from "react-icons/fa";
import styles from "../../styles/pages/RecurringBillsPage.module.css";

const RecurringListView = ({
  recurringItems,
  editingId,
  editFormData,
  expandedId,
  handleMarkPaid,
  handleSkip,
  handleToggleAutopay,
  handleEdit,
  handleDelete,
  toggleInfo,
  setEditFormData,
  setEditingId,
  saveEdit,
  getCategoryName,
  getPaymentTypeName,
  getMerchantName,
}) => {
  return (
    <div className={styles.listView}>
      <div className={styles.legend}>
        <ul>
          <li>
            <b> Mark as Paid:</b> When clicked, This will mark the recurring
            payment as “Paid” and update its next due date.
          </li>
          <li>
            <b>Skip:</b> When clicked, This will skip the upcoming occurrence
            and set the due date to the next due date.
          </li>
          <li>
            <b>Autopay:</b> When enabled, this will automatically mark the bill
            as paid on the due date and update its next due date
          </li>
          <li>
            <b>
              <FaInfoCircle />
            </b>
            {" : "}
            When clicked, this will show additional details
          </li>
        </ul>
      </div>
      <table className={styles.recurringTable}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Frequency</th>
            <th>Next Due Date</th>
            <th>Autopay</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recurringItems.map((item) => (
            <React.Fragment key={item.id}>
              <tr>
                {editingId === item.id ? (
                  // Edit Mode
                  <>
                    <td>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            title: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editFormData.amount}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            amount: e.target.value,
                          })
                        }
                        step="0.01"
                      />
                    </td>
                    <td>
                      <select
                        value={editFormData.frequency}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            frequency: e.target.value,
                          })
                        }
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        value={editFormData.next_due_date}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            next_due_date: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>{item.autopay_enabled ? "Enabled" : "Disabled"}</td>
                    <td>
                      <Button onClick={saveEdit} variant="success" size="small">
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          setEditFormData({});
                        }}
                        variant="secondary"
                        size="small"
                      >
                        Cancel
                      </Button>
                    </td>
                  </>
                ) : (
                  // Read-Only Mode
                  <>
                    <td>{item.title}</td>
                    <td>${Number(item.amount).toFixed(2)}</td>
                    <td>{item.frequency}</td>
                    <td>{new Date(item.next_due_date).toLocaleDateString()}</td>
                    <td className={styles.autopayColumn}>
                      <Button
                        onClick={() =>
                          handleToggleAutopay(item.id, item.autopay_enabled)
                        }
                        size="small"
                        className={styles.autopayToggle}
                      >
                        {item.autopay_enabled ? (
                          <FaToggleOn />
                        ) : (
                          <FaToggleOff />
                        )}
                      </Button>
                    </td>
                    <td>
                      <div className={styles.actionContainer}>
                        <div className={styles.primaryActions}>
                          <Button
                            onClick={() => handleMarkPaid(item.id)}
                            variant="success"
                            size="small"
                          >
                            Mark as Paid
                          </Button>
                          <Button
                            onClick={() => handleSkip(item.id)}
                            variant="warning"
                            size="small"
                          >
                            Skip
                          </Button>
                        </div>
                        <div className={styles.secondaryActions}>
                          <Button
                            onClick={() => handleEdit(item.id)}
                            variant="info"
                            size="small"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            variant="danger"
                            size="small"
                          >
                            <FaTrash />
                          </Button>
                          <Button
                            onClick={() => toggleInfo(item.id)}
                            variant="secondary"
                            size="small"
                          >
                            <FaInfoCircle />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </>
                )}
              </tr>
              {expandedId === item.id && (
                <tr className={styles.expandedRow}>
                  <td colSpan="6">
                    <div className={styles.expandedContent}>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {new Date(item.start_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Category:</strong>{" "}
                        {getCategoryName(item.category_id)}
                      </p>
                      <p>
                        <strong>Payment Type:</strong>{" "}
                        {getPaymentTypeName(item.payment_type_id)}
                      </p>
                      <p>
                        <strong>Merchant:</strong>{" "}
                        {getMerchantName(item.merchant_id)}
                      </p>
                      <p>
                        <strong>Item Type:</strong> {item.item_type}
                      </p>
                      <p>
                        <strong>Notes:</strong> {item.notes || "None"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringListView;
