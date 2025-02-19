import React, { useState, useEffect, useRef } from "react";
import { FaUpload, FaUniversity } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentTypes } from "../redux/listSlice";
import {
  uploadBankStatement,
  fetchExpenses,
  saveStatementExpenses,
  reuploadStatement,
  resetStatementData,
  setUploadProgress,
} from "../redux/expensesSlice";
import Button from "../components/Button";
import styles from "../styles/FileUpload.module.css";

const FileUpload = ({ paymentSources }) => {
  const [file, setFile] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);

  const [forceUpdateRequested, setForceUpdateRequested] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Create a ref for the file input element
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { uploadedTransactions, status, error, statementId, uploadProgress } =
    useSelector((state) => state.expenses);
  const { paymentTypes } = useSelector((state) => state.lists);

  console.log("Current upload progress:", uploadProgress);

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
    setForceUpdateRequested(false);
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
      dispatch(setUploadProgress(0));
      await dispatch(uploadBankStatement(formData)).unwrap();
      setPreviewActive(true);
      setUploadError(null);
    } catch (error) {
      setUploadError(error.message || "File upload failed.");
    }
  };

  const handleForceUpdateRequest = () => {
    setForceUpdateRequested(true);
    setShowDuplicateModal(false);
    console.log("Uploaded transactions:", uploadedTransactions);

    if (uploadedTransactions && uploadedTransactions.length > 0) {
      setPreviewActive(true);
    }
  };

  const handleCancelPreview = () => {
    // Reset local state related to the file upload
    setPreviewActive(false);
    setForceUpdateRequested(false);
    setFile(null);
    setSelectedPaymentType("");
    setUploadError(null);
    // Optionally, clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Also, you can dispatch resetStatementData if needed
    dispatch(resetStatementData());
  };

  const handleConfirmUpload = async () => {
    if (!uploadedTransactions.length) {
      setUploadError("No transactions to save!");
      return;
    }
    setIsSaving(true);
    try {
      console.log("frontend payment type", selectedPaymentType);
      if (forceUpdateRequested && statementId) {
        await dispatch(reuploadStatement(statementId)).unwrap();
      }

      await dispatch(
        saveStatementExpenses({
          transactions: uploadedTransactions,
          paymentTypes: selectedPaymentType,
          statementId,
          forceUpdate: forceUpdateRequested,
          fileName: file ? file.name : null,
        })
      ).unwrap();

      setFile(null);
      setSelectedPaymentType("");
      setPreviewActive(false);
      setUploadError(null);

      setForceUpdateRequested(false);

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

      <form className={styles.form}>
        {/* File Input Section with Icon */}
        <div className={styles.inputGroup}>
          <FaUpload className={styles.icon} />

          <div className={styles.fileInputContainer}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, .pdf"
              className={styles.input}
            />
            <div className={styles.fileInputLabel}>
              <span>{file ? file.name : "Choose a file (CSV/PDF)"}</span>
            </div>
          </div>
        </div>

        {/* Payment Type Selector */}
        <div className={styles.inputGroup}>
          <FaUniversity className={styles.icon} />
          <select
            value={selectedPaymentType}
            onChange={(e) => setSelectedPaymentType(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Select the source</option>
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
                <Button
                  variant="primary"
                  onClick={handleCancelPreview}
                  className={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleForceUpdateRequest}
                  className={styles.forceUpdateButton}
                >
                  Force Update
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload action button */}
        {!showDuplicateModal && !previewActive && (
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Processing..." : "Upload & Preview"}
          </Button>
        )}

        {/* ✅ Show progress bar when uploading */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${uploadProgress}%` }}
            >
              <div className={styles.progressText}>{uploadProgress}%</div>
            </div>
          </div>
        )}

        {/* Preview or placeholder */}
        {previewActive && uploadedTransactions.length > 0 ? (
          <div className={styles.preview}>
            <h3>Preview Transactions</h3>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  <th>Posted Date</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Payment Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {uploadedTransactions.map((txn, index) => (
                  <tr key={index}>
                    <td>{txn.postedDate}</td>
                    <td>
                      {txn.expense_name ||
                        txn.refinedMerchantName ||
                        "No name fileUpload"}
                    </td>
                    <td>${Number(txn.amount).toFixed(2)}</td>
                    <td>{txn.refinedMerchantName || "Unknown Merchant"}</td>
                    <td>{txn.suggestedCategory || "Uncategorized"}</td>
                    <td>
                      {paymentTypes.find(
                        (pt) => pt.id === Number(selectedPaymentType)
                      )?.payment_type || "Unknown"}
                    </td>
                    <td>{txn.fullDescription || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.buttonContainer}>
              <Button variant="secondary" onClick={handleCancelPreview}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmUpload}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Confirm & Save"}
              </Button>
            </div>
          </div>
        ) : (
          /* -- If we DO NOT have preview transactions, show the a message-- */
          <div className={styles.mainExpenses}>
            <h3>Please upload a bank statement to preview transactions</h3>
          </div>
        )}
        {/* -- End of mainExpenses div -- */}
      </form>
    </div>
  );
};

export default FileUpload;
