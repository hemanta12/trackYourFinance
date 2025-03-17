import React, { useState } from "react";
import CategoryManager from "./CategoryManager";
import PaymentTypeManager from "./PaymentTypeManager";
import SourceManager from "./SourceManager";
import MerchantManager from "./MerchantManager";
import styles from "../../styles/components/Settings.module.css";
import useWindowDimensions from "../../utils/useWindowDimensions";

const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const { width } = useWindowDimensions();

  const renderTabContent = () => {
    if (activeTab === "categories") return <CategoryManager />;
    if (activeTab === "paymentTypes") return <PaymentTypeManager />;
    if (activeTab === "sources") return <SourceManager />;
    if (activeTab === "merchants") return <MerchantManager />;
  };

  return (
    <div className={styles.container}>
      <h2>Edit or Delete the List</h2>
      {width < 480 ? (
        // Mobile view: Use a select dropdown for navigation
        <div style={{ marginBottom: "15px" }}>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className={styles.mobileSelect}
          >
            <option value="categories">Categories</option>
            <option value="merchants">Merchants</option>
            <option value="paymentTypes">Payment Types</option>
            <option value="sources">Sources</option>
          </select>
        </div>
      ) : (
        // Desktop view: Use tab buttons
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
      )}

      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
};

export default SettingsLayout;
