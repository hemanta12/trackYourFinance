import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecurringItems,
  markRecurringItemPaid,
  skipRecurringItem,
  toggleAutopayRecurringItem,
  deleteRecurringItem,
  updateRecurringItem,
  fetchBillPayments,
} from "../redux/recurringSlice";
import Button from "../components/common/Button";
import RecurringForm from "../components/forms/RecurringForm";
import RecurringListView from "../components/lists/RecurringListView";
import RecurringCalendarView from "../components/lists/RecurringCalendarView";
import BillPaymentHistory from "../components/lists/BillPaymentHistory";
import styles from "../styles/pages/RecurringBillsPage.module.css";

const RecurringBillsPage = () => {
  const dispatch = useDispatch();
  const recurringItems = useSelector((state) => state.recurring.data);
  const status = useSelector((state) => state.recurring.status);
  const error = useSelector((state) => state.recurring.error);
  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  // Top-level view state
  const [view, setView] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [currentViewTitle, setCurrentViewTitle] = useState("");
  const [currentCalendarYear, setCurrentCalendarYear] = useState(
    new Date().getFullYear()
  );

  // Inline editing / expanded info states for list view
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchRecurringItems());
    }
  }, [status, dispatch]);

  // Helper functions to get friendly names for display
  const getCategoryName = (id) => {
    const cat = categories.find((c) => Number(c.id) === Number(id));
    return cat ? cat.category : "Unknown";
  };

  const getPaymentTypeName = (id) => {
    const pt = paymentTypes.find((pt) => Number(pt.id) === Number(id));
    return pt ? pt.payment_type : "Unknown";
  };

  const getMerchantName = (id) => {
    const m = merchants.find((m) => Number(m.id) === Number(id));
    return m ? m.name : "Unknown Merchant";
  };

  // Action handlers for the list view
  const handleMarkPaid = (id) => {
    dispatch(markRecurringItemPaid(id))
      .unwrap()
      .then(() => {
        dispatch(fetchBillPayments());
      })
      .catch((error) => {
        console.error("Failed to mark recurring item as paid:", error);
      });
  };

  const handleSkip = (id) => {
    dispatch(skipRecurringItem(id));
  };

  const handleToggleAutopay = (id, currentStatus) => {
    dispatch(
      toggleAutopayRecurringItem({ id, autopay_enabled: !currentStatus })
    );
  };

  const handleEdit = (id) => {
    const item = recurringItems.find((item) => item.id === id);
    if (item) {
      setEditFormData({
        title: item.title,
        amount: item.amount,
        frequency: item.frequency,
        start_date: item.start_date.split("T")[0],
        next_due_date: item.next_due_date.split("T")[0],
        autopay_enabled: Boolean(item.autopay_enabled),
        active: item.active,
        category_id: item.category_id,
        payment_type_id: item.payment_type_id,
        merchant_id: item.merchant_id,
        notes: item.notes,
      });
      setEditingId(id);
    }
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this recurring item? This action cannot be undone."
      )
    ) {
      dispatch(deleteRecurringItem(id))
        .unwrap()
        .then(() => console.log("Recurring item deleted successfully."))
        .catch((error) =>
          console.error("Failed to delete recurring item:", error)
        );
    }
  };

  const saveEdit = () => {
    if (
      !editFormData.title ||
      !editFormData.amount ||
      !editFormData.frequency ||
      !editFormData.next_due_date
    ) {
      alert("Please fill out all required fields.");
      return;
    }
    dispatch(
      updateRecurringItem({
        id: editingId,
        data: {
          title: editFormData.title,
          amount: Number(editFormData.amount),
          frequency: editFormData.frequency,
          start_date: editFormData.start_date,
          active: editFormData.active || 1,
          next_due_date: editFormData.next_due_date,
          autopay_enabled: editFormData.autopay_enabled ? 1 : 0,
          category_id: Number(editFormData.category_id),
          payment_type_id: Number(editFormData.payment_type_id),
          merchant_id: editFormData.merchant_id
            ? Number(editFormData.merchant_id)
            : null,
          notes: editFormData.notes,
        },
      })
    )
      .unwrap()
      .then(() => {
        setEditingId(null);
        setEditFormData({});
      })
      .catch((error) =>
        console.error("Failed to update recurring item:", error)
      );
  };

  const toggleInfo = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Render the page by toggling between list view and calendar view.
  return (
    <div className={styles.container}>
      <h2>Recurring Bills & Subscriptions</h2>
      <div className={styles.topControls}>
        <div className={styles.viewToggles}>
          <Button
            onClick={() => setView("list")}
            variant={view === "list" ? "primary" : "secondary"}
          >
            List View
          </Button>
          <Button
            onClick={() => setView("calendar")}
            variant={view === "calendar" ? "primary" : "secondary"}
          >
            Calendar View
          </Button>
        </div>
        <div className={styles.addNew}>
          <Button onClick={() => setShowForm(true)} variant="primary">
            + Add New Recurring
          </Button>
        </div>
      </div>
      {showForm && <RecurringForm onClose={() => setShowForm(false)} />}
      {status === "loading" && <p>Loading...</p>}
      {status === "failed" && <p>Error: {error}</p>}
      {view === "list" ? (
        <RecurringListView
          recurringItems={recurringItems}
          editingId={editingId}
          editFormData={editFormData}
          expandedId={expandedId}
          setEditingId={setEditingId}
          setEditFormData={setEditFormData}
          setExpandedId={setExpandedId}
          handleMarkPaid={handleMarkPaid}
          handleSkip={handleSkip}
          handleToggleAutopay={handleToggleAutopay}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          toggleInfo={toggleInfo}
          saveEdit={saveEdit}
          getCategoryName={getCategoryName}
          getPaymentTypeName={getPaymentTypeName}
          getMerchantName={getMerchantName}
        />
      ) : (
        <RecurringCalendarView
          recurringItems={recurringItems}
          currentViewTitle={currentViewTitle}
          setCurrentViewTitle={setCurrentViewTitle}
          currentCalendarYear={currentCalendarYear}
          setCurrentCalendarYear={setCurrentCalendarYear}
        />
      )}

      <BillPaymentHistory />
    </div>
  );
};

export default RecurringBillsPage;
