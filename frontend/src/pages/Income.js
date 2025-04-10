import React from "react";
import IncomeForm from "../components/forms/IncomeForm";
import IncomeList from "../components/lists/IncomeList";
import { useSelector } from "react-redux";

const Income = () => {
  const income = useSelector((state) => state.income.data);
  const loading = useSelector((state) => state.income.loading);

  if (loading) {
    return <p>Loading income...</p>;
  }
  return (
    <div className="pageContainer" style={{ marginTop: "0" }}>
      <h2>Welcome to Income Page</h2>
      <IncomeForm />
      <IncomeList income={income} />
    </div>
  );
};

export default Income;
