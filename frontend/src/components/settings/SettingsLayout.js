import React, { useState } from "react";
import CategoryManager from "./CategoryManager";
import PaymentTypeManager from "./PaymentTypeManager";
import SourceManager from "./SourceManager";
import MerchantManager from "./MerchantManager";
import styles from "../../styles/components/Settings.module.css";

const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className={styles.container}>
      <h2>Edit or Delete the List</h2>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "categories" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>

        <button
          className={`${styles.tabButton} ${
            activeTab === "merchants" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("merchants")}
        >
          Merchants
        </button>

        <button
          className={`${styles.tabButton} ${
            activeTab === "paymentTypes" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("paymentTypes")}
        >
          Payment Types
        </button>

        <button
          className={`${styles.tabButton} ${
            activeTab === "sources" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("sources")}
        >
          Sources
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "categories" && <CategoryManager />}
        {activeTab === "paymentTypes" && <PaymentTypeManager />}
        {activeTab === "sources" && <SourceManager />}
        {activeTab === "merchants" && <MerchantManager />}
      </div>
    </div>
  );
};

export default SettingsLayout;
