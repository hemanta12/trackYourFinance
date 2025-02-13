import React, { useState } from "react";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import FileUpload from "../components/FileUpload";
import MultiExpenseModal from "../components/MultiExpenseModal";
import "../styles/ExpensesTabs.css";
import { useSelector } from "react-redux";
import Button from "../components/Button";
import { addCategory, addPaymentType, addMerchant } from "../services/api";

const Expenses = () => {
  const expenses = useSelector((state) => state.expenses.data);
  const loading = useSelector((state) => state.expenses.loading);
  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  const [activeTab, setActiveTab] = useState("single"); // Default: no modal open

  if (loading) {
    return <p>Loading expenses...</p>;
  }

  return (
    <div className="pageContainer">
      <h2>Expenses</h2>

      <div
        className="tabs"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        <Button
          variant={activeTab === "single" ? "primary" : "secondary"}
          size="small"
          onClick={() => setActiveTab("single")}
        >
          Add Single Expense
        </Button>

        {/* <Button
          variant={activeTab === "import" ? "primary" : "secondary"}
          size="small"
          onClick={() => setActiveTab("import")}
        >
          Import Bank Statement
        </Button> */}
        <Button
          variant={activeTab === "multiple" ? "primary" : "secondary"}
          size="small"
          onClick={() => setActiveTab("multiple")}
        >
          Add multiple expenses
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
      <ExpenseList expenses={expenses} />
    </div>
  );
};

export default Expenses;
