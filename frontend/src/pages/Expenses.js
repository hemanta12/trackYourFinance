import React, { useState } from "react";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import FileUpload from "../components/FileUpload";
import "../styles/ExpensesTabs.css";
import { useSelector } from "react-redux";
import Button from "../components/Button";

const Expenses = () => {
  const expenses = useSelector((state) => state.expenses.data);
  const loading = useSelector((state) => state.expenses.loading);
  const [activeTab, setActiveTab] = useState("manual");

  if (loading) {
    return <p>Loading expenses...</p>;
  }

  return (
    <div className="pageContainer">
      <h2>Expenses</h2>

      <div className="tabs">
        <Button
          variant={activeTab === "manual" ? "primary" : "secondary"}
          size="small"
          onClick={() => setActiveTab("manual")}
        >
          Add Single Expense
        </Button>
        <Button
          variant={activeTab === "import" ? "primary" : "secondary"}
          size="small"
          onClick={() => setActiveTab("import")}
        >
          Import Bank Statement
        </Button>
      </div>

      <div className="tabContent">
        {activeTab === "manual" && <ExpenseForm />}
        {activeTab === "import" && <FileUpload />}
      </div>
      <ExpenseList expenses={expenses} />
    </div>
  );
};

export default Expenses;
