import React, { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { fetchRecurringItems } from "../../redux/recurringSlice";
import styles from "../../styles/components/lists/UpcomingPaymentsWidget.module.css";

const UpcomingPaymentsWidget = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: recurringItems } = useSelector((state) => state.recurring);
  const merchants = useSelector((state) => state.lists.merchants);

  // If "data" is empty or status is "idle," dispatch the fetch
  useEffect(() => {
    dispatch(fetchRecurringItems());
  }, [dispatch]);

  // Calculate date range: today to 30 days ahead.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  // Filter recurring items to get upcoming payments within the 30-day window.
  const upcomingPayments = useMemo(() => {
    return recurringItems
      .filter((item) => {
        const dueDate = new Date(item.next_due_date);
        return dueDate >= today && dueDate <= thirtyDaysLater;
      })
      .sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date));
  }, [recurringItems, today, thirtyDaysLater]);

  // Compute summary: total payments count and total amount.
  const summary = useMemo(() => {
    const count = upcomingPayments.length;
    const total = upcomingPayments.reduce(
      (acc, item) => acc + Number(item.amount),
      0
    );
    return { count, total };
  }, [upcomingPayments]);

  // Format date for display.
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getMerchantName = (id) => {
    const m = merchants.find((m) => Number(m.id) === Number(id));
    return m ? m.name : "Unknown Merchant";
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header}>
        <h3>Upcoming Payments</h3>
        <div className={styles.summary}>
          <span>
            {summary.count} Payment{summary.count !== 1 ? "s" : ""}
          </span>
          <span>Total: ${summary.total.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.paymentsTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Merchant</th>
            </tr>
          </thead>
          <tbody>
            {upcomingPayments.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.next_due_date)}</td>
                <td>{item.title}</td>
                <td>${Number(item.amount).toFixed(2)}</td>
                <td>{getMerchantName(item.merchant_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <Button onClick={() => navigate("/recurring-bills")} variant="primary">
          View More
        </Button>
      </div>
    </div>
  );
};

export default UpcomingPaymentsWidget;
