import React, { useState } from "react";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import FileUpload from "../components/FileUpload";
import MultiExpenseModal from "../components/MultiExpenseModal";
import "../styles/ExpensesTabs.css";
import { useSelector } from "react-redux";
import Button from "../components/Button";
import ExpenseFilterBar from "../components/ExpenseFilterBar";
import { addCategory, addPaymentType, addMerchant } from "../services/api";

const Expenses = () => {
  const expenses = useSelector((state) => state.expenses.data);
  const loading = useSelector((state) => state.expenses.loading);
  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  const [activeTab, setActiveTab] = useState("");

  const [filterCategory, setFilterCategory] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("");
  const [filterMerchant, setFilterMerchant] = useState("");

  if (loading) {
    return <p>Loading expenses...</p>;
  }

  return (
    <div className="pageContainer">
      <h2>Welcome to Expenses Page</h2>

      <div className="tabs">
        <Button
          className={activeTab === "single" ? "tabButton active" : "tabButton"}
          onClick={() => setActiveTab("single")}
        >
          Add Single Expense
        </Button>

        <Button
          className={
            activeTab === "multiple" ? "tabButton active" : "tabButton"
          }
          onClick={() => setActiveTab("multiple")}
        >
          Add Multiple Expenses
        </Button>

        <Button
          className={activeTab === "import" ? "tabButton active" : "tabButton"}
          onClick={() => setActiveTab("import")}
        >
          Import Bank Statement
        </Button>
      </div>

      <div className="tabContent">
        {activeTab === "single" && <ExpenseForm />}
        {activeTab === "import" && <FileUpload />}
        {activeTab === "multiple" && (
          <MultiExpenseModal
            onClose={() => setActiveTab("manual")}
            categoryOptions={categories.map((cat) => ({
              label: cat.category,
              value: cat.id,
            }))}
            paymentTypeOptions={paymentTypes.map((pt) => ({
              label: pt.payment_type,
              value: pt.id,
            }))}
            merchantOptions={merchants.map((m) => ({
              label: m.name,
              value: m.id,
            }))}
            onAddNewCategory={async (newCategory) => {
              const res = await addCategory(newCategory);
              return { label: res.category, value: res.id };
            }}
            onAddNewPaymentType={async (newPaymentType) => {
              const res = await addPaymentType(newPaymentType);
              return { label: res.payment_type, value: res.id };
            }}
            onAddNewMerchant={async (newMerchant) => {
              const res = await addMerchant(newMerchant);
              return { label: res.name, value: res.id };
            }}
          />
        )}
      </div>

      {/* --- Filter Bar --- */}
      <ExpenseFilterBar
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        filterPayment={filterPaymentType}
        onPaymentChange={setFilterPaymentType}
        filterMerchant={filterMerchant}
        onMerchantChange={setFilterMerchant}
      />
      <ExpenseList
        expenses={expenses}
        filterCategory={filterCategory}
        filterPayment={filterPaymentType}
        filterMerchant={filterMerchant}
      />
    </div>
  );
};

export default Expenses;
