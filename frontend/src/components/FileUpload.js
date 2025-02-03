import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentTypes } from "../redux/listSlice";
import {
  uploadBankStatement,
  fetchExpenses,
  saveStatementExpenses,
  reuploadStatement,
  resetStatementData,
} from "../redux/expensesSlice";
import styles from "../styles/FileUpload.module.css";

const FileUpload = ({ paymentSources }) => {
  const [file, setFile] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Create a ref for the file input element
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { uploadedTransactions, status, error, statementId } = useSelector(
    (state) => state.expenses
  );
  const { paymentTypes } = useSelector((state) => state.lists);

  // Reset file-upload-related state and fetch payment types on mount
  useEffect(() => {
    dispatch(resetStatementData());
    dispatch(fetchPaymentTypes());
  }, [dispatch]);

  // Set upload error if error object contains a statement_id
  useEffect(() => {
    if (error && typeof error === "object" && error.statement_id) {
      setUploadError(typeof error === "string" ? error : error.message);
    }
  }, [error]);

  // Show duplicate modal if statementId and error exist
  useEffect(() => {
    if (statementId && error) {
      setShowDuplicateModal(true);
    } else {
      setShowDuplicateModal(false);
    }
  }, [statementId, error]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadError(null);
    setPreviewActive(false);
  };

  const handleUpload = async () => {
    if (!file || !selectedPaymentType) {
      alert("Please select a file and payment source.");
      setUploadError("Please select a file and payment source.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading File:", file); // 🔍 Debug Log
      console.log("statement_id in saveStatementExpenses: ", statementId);

      await dispatch(uploadBankStatement(formData)).unwrap();
      setPreviewActive(true);
      setUploadError(null);
    } catch (error) {
      setUploadError(error.message || "File upload failed.");
    }
  };

  // ✅ Function to handle "Upload Anyway" scenario
  const handleForceUpload = async () => {
    if (!statementId) return;
    try {
      setPreviewActive(false);
      console.log("🔥 Force update started. StatementId:", statementId);
      // 1) "Reupload" on backend (which deletes the old statement records)
      await dispatch(reuploadStatement(statementId)).unwrap();

      // 2) Clear out any old error and statement ID to avoid confusion
      setUploadError(null);
      console.log("Reupload successful. Clearing statement ID.");

      // 3) Attempt fresh upload
      await handleUpload();
    } catch (error) {
      console.error("❌ reuploadStatement failed:", error.message);
      setUploadError("Error reprocessing statement: " + error.message);
    }
  };

  const handleConfirmUpload = async () => {
    if (!uploadedTransactions.length) {
      setUploadError("No transactions to save!");
      return;
    }
    setIsSaving(true);
    try {
      console.log("frontend payment type", selectedPaymentType);

      await dispatch(
        saveStatementExpenses({
          transactions: uploadedTransactions,
          paymentTypes: selectedPaymentType,
          statementId,
        })
      ).unwrap();

      setFile(null);
      setSelectedPaymentType("");
      setPreviewActive(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      dispatch(fetchExpenses());
    } catch (error) {
      setUploadError("Failed to save transactions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Upload Bank Statement</h2>
      {uploadError && <div className={styles.error}>{uploadError}</div>}

      {/* File and Payment Type inputs */}
      <div className={styles.inputGroup}>
        <label>Choose a file (CSV/PDF)</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .pdf"
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Select Payment Type</label>
        <select
          value={selectedPaymentType}
          onChange={(e) => setSelectedPaymentType(e.target.value)}
        >
          <option value="">Select Payment Type</option>
          {paymentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.payment_type}
            </option>
          ))}
        </select>
      </div>

      {/* Show modal if duplicate detected */}
      {showDuplicateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Statement Already Uploaded</h3>
            <p>
              This bank statement has already been uploaded. Forcing an update
              will remove the previous transactions and replace them with this
              new upload.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  // Cancel the duplicate reupload
                  setShowDuplicateModal(false);
                  setUploadError(null);
                  // Optionally clear file selection
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }

                  // Optionally, clear the selected payment type
                  setSelectedPaymentType("");
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Force update: hide modal, reset preview flag, and proceed.
                  setShowDuplicateModal(false);
                  await handleForceUpload();
                }}
                className={styles.forceUpdateButton}
              >
                Force Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload action button */}
      {!showDuplicateModal && (
        <button onClick={handleUpload} disabled={status === "loading"}>
          {status === "loading" ? "Processing..." : "Upload & Preview"}
        </button>
      )}

      {/* Preview or placeholder */}
      {previewActive && uploadedTransactions.length > 0 ? (
        <div className={styles.preview}>
          <h3>Preview Transactions</h3>
          <table>
            <thead>
              <tr>
                <th>Posted Date</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Payment Type</th>
              </tr>
            </thead>
            <tbody>
              {uploadedTransactions.map((txn, index) => (
                <tr key={index}>
                  <td>{txn.postedDate}</td>
                  <td>{txn.merchant}</td>
                  <td>${txn.amount.toFixed(2)}</td>
                  <td>
                    {paymentTypes.find(
                      (pt) => pt.id === Number(selectedPaymentType)
                    )?.payment_type || "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleConfirmUpload} disabled={isSaving}>
            {isSaving ? "Saving..." : "Confirm & Save"}
          </button>
        </div>
      ) : (
        /* -- If we DO NOT have preview transactions, show the a message-- */
        <div className={styles.mainExpenses}>
          <h3>Please upload a bank statement to preview transactions</h3>
        </div>
      )}
      {/* -- End of mainExpenses div -- */}
    </div>
  );
};

export default FileUpload;
