import React from "react";
import { useSelector } from "react-redux";
import AutoSuggestInput from "../../utils/autoSuggestInput";
import styles from "../../styles/components/filters/ExpenseFilterBar.module.css";

function ExpenseFilterBar({
  filterCategory,
  onCategoryChange,
  filterPayment,
  onPaymentChange,
  filterMerchant,
  onMerchantChange,
}) {
  // Get lists from Redux (already fetched in a higher component or elsewhere).
  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  return (
    <>
      <h3>Filter Expenses</h3>
      <div className={styles.filterBar}>
        {/* Category Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Category</label>
          <AutoSuggestInput
            // We do NOT pass `name` or `control` because we're not in RHF mode
            options={categories.map((cat) => ({
              label: cat.category,
              value: cat.id,
            }))}
            placeholder="Filter by Category"
            value={filterCategory}
            onChange={(newVal) => onCategoryChange(newVal)}
          />
        </div>

        {/* Payment Type Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Payment Type</label>
          <AutoSuggestInput
            options={paymentTypes.map((pt) => ({
              label: pt.payment_type,
              value: pt.id,
            }))}
            placeholder="Filter by Payment"
            value={filterPayment}
            onChange={(newVal) => {
              onPaymentChange(newVal);
            }}
          />
        </div>

        {/* Merchant Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Merchant</label>
          <AutoSuggestInput
            options={merchants.map((m) => ({
              label: m.name,
              value: m.id,
            }))}
            placeholder="Filter by Merchant"
            value={filterMerchant}
            onChange={(newVal) => onMerchantChange(newVal)}
          />
        </div>
      </div>
    </>
  );
}

export default ExpenseFilterBar;
