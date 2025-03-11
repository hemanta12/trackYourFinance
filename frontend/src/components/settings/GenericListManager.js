import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styles from "../../styles/components/Settings.module.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Button from "../common/Button";

const GenericListManager = ({
  title,
  items,
  displayProp,
  paramName = displayProp,
  updateThunk,
  deleteThunk,
  fetchThunk,
  createThunk,
}) => {
  const dispatch = useDispatch();

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editFeedback, setEditFeedback] = useState(null);

  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [addFeedback, setAddFeedback] = useState(null);

  const sortedItems = [...items]
    .filter((item) => item)
    .sort((a, b) => a[displayProp].localeCompare(b[displayProp]));

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item[displayProp]);
    setEditFeedback(null);
  };

  const handleSave = async (id) => {
    if (editValue.trim() === "") {
      setEditFeedback({ message: "Value cannot be empty.", type: "error" });
      return;
    }
    try {
      await dispatch(updateThunk({ id, [paramName]: editValue })).unwrap();
      setEditFeedback({ message: "Updated successfully!", type: "success" });
      setEditingId(null);
      dispatch(fetchThunk());
      setTimeout(() => setEditFeedback(null), 5000);
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Failed to update";

      setEditFeedback({ message: errorMessage, type: "error" });

      setTimeout(() => setEditFeedback(null), 10000);
    }
  };

  const initiateDelete = (id) => {
    setPendingDeleteId(id);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const confirmDelete = async (id) => {
    const item = sortedItems.find((item) => item.id === id);
    try {
      await dispatch(deleteThunk(id)).unwrap();
      setDeleteFeedback({
        message: `${item ? item[displayProp] : "Item"} deleted successfully!`,
        type: "success",
      });
      dispatch(fetchThunk());
      setPendingDeleteId(null);
      setTimeout(() => setDeleteFeedback(null), 5000);
    } catch (error) {
      setDeleteFeedback({
        message: `Failed to delete '${item ? item[displayProp] : "item"}'.`,
        type: "error",
      });
      setTimeout(() => setDeleteFeedback(null), 10000);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedItems([]);
    if (editingId) {
      setEditingId(null);
    }
  };

  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleSelectAll = () => {
    const allIds = sortedItems.map((item) => item.id);
    setSelectedItems(allIds);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleDeleteSelected = async () => {
    const itemMap = new Map(
      sortedItems.map((item) => [item.id, item[displayProp]])
    );
    try {
      const results = await Promise.allSettled(
        selectedItems.map((id) => dispatch(deleteThunk(id)).unwrap())
      );

      let successCount = 0;
      const failedItems = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          failedItems.push(selectedItems[index]);
        }
      });

      if (failedItems.length === 0) {
        setDeleteFeedback({
          message: `${successCount} items deleted successfully!`,
          type: "success",
        });
      } else {
        const failedNames = failedItems.map((id) => itemMap.get(id));
        setDeleteFeedback({
          message: `${successCount} items deleted successfully; Failed to delete: ${failedNames.join(
            ", "
          )}`,
          type: "error",
        });
      }
      dispatch(fetchThunk());
      setSelectedItems([]);
      setTimeout(() => setDeleteFeedback(null), 5000);
    } catch (error) {
      setDeleteFeedback({
        message: "Failed to delete selected items.",
        type: "error",
      });
    }
  };
  const startAddNew = () => {
    setIsAdding(true);
    setNewValue("");
    setAddFeedback(null);
  };

  const cancelAddNew = () => {
    setIsAdding(false);
    setNewValue("");
    setAddFeedback(null);
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleAddNew = async () => {
    if (!newValue.trim()) {
      setAddFeedback({
        message: "Input value cannot be empty.",
        type: "error",
      });
      return;
    }

    //Convert the first letter to uppercase, the rest to lowercase
    const normalized =
      newValue.trim().charAt(0).toUpperCase() +
      newValue.trim().slice(1).toLowerCase();

    const alreadyExists = sortedItems.some(
      (item) => item[displayProp].toLowerCase() === normalized.toLowerCase()
    );
    if (alreadyExists) {
      setAddFeedback({ message: "That name already exists.", type: "error" });
      return;
    }
    try {
      await dispatch(createThunk(normalized)).unwrap();
      await wait(500);
      dispatch(fetchThunk());
      setAddFeedback({ message: "Created successfully!", type: "success" });
      setNewValue("");

      setTimeout(() => setAddFeedback(null), 3000);
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Failed to create item.";
      setAddFeedback({ message: errorMessage, type: "error" });

      setTimeout(() => setAddFeedback(null), 10000);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <h3>{title}</h3>

      {addFeedback && (
        <div
          className={`${styles.feedbackMessage} ${styles[addFeedback.type]}`}
        >
          {addFeedback.message}
        </div>
      )}
      {deleteFeedback && (
        <div
          className={`${styles.feedbackMessage} ${styles[deleteFeedback.type]}`}
        >
          {deleteFeedback.message}
        </div>
      )}

      <div style={{ marginBottom: "10px" }}>
        <Button
          variant="primary"
          size="small"
          onClick={toggleSelectMode}
          className={styles.editBtn}
        >
          {selectMode ? "Exit" : "Manage"}
        </Button>
        {selectMode && (
          <div className={styles.multiSelectToolbar}>
            <Button
              variant="primary"
              size="small"
              onClick={handleSelectAll}
              className={styles.editBtn}
              style={{ marginLeft: "5px" }}
            >
              Select All
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={handleClearSelection}
              className={styles.cancelBtn}
              style={{ marginLeft: "5px" }}
              disabled={selectedItems.length === 0}
            >
              Clear Selection
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={handleDeleteSelected}
              className={styles.deleteBtn}
              style={{ marginLeft: "5px" }}
              disabled={selectedItems.length === 0}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {!isAdding ? (
        <Button
          variant="primary"
          size="small"
          className={styles.editBtn}
          onClick={startAddNew}
          style={{ marginBottom: "10px" }}
        >
          + Add a new item
        </Button>
      ) : (
        <div
          className={styles.listItem}
          style={{ backgroundColor: "#f9f9f9", marginBottom: "10px" }}
        >
          {/* Inline "Add" form */}
          <div className={styles.editContainer} style={{ width: "100%" }}>
            <div className={styles.editInputContainer}>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className={styles.editInput}
                placeholder="Enter new name"
              />
            </div>
            <div className={styles.buttonContainer}>
              <Button
                variant="success"
                size="small"
                onClick={handleAddNew}
                className={styles.saveBtn}
              >
                Save
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={cancelAddNew}
                className={styles.cancelBtn}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.listContainer}>
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.listItem} ${
              editingId === item.id ? styles.editMode : ""
            }`}
          >
            {selectMode && (
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={(e) =>
                  handleCheckboxChange(item.id, e.target.checked)
                }
                style={{ marginRight: "8px" }}
              />
            )}
            {editingId === item.id ? (
              <>
                {editFeedback && (
                  <div
                    className={`${styles.feedbackMessage} ${
                      styles[editFeedback.type]
                    }`}
                  >
                    {editFeedback.message}
                  </div>
                )}
                <div className={styles.editContainer}>
                  <div className={styles.editInputContainer}>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={styles.editInput}
                    />
                  </div>

                  <div className={styles.buttonContainer}>
                    <Button
                      variant="success"
                      size="small"
                      onClick={() => handleSave(item.id)}
                      className={styles.saveBtn}
                    >
                      Save
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => setEditingId(null)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.itemContainer}>
                <span>{item[displayProp]}</span>

                {!selectMode && (
                  <div className={styles.actions}>
                    <Button
                      variant="warning"
                      size="small"
                      onClick={() => handleEdit(item)}
                      className={styles.editBtn}
                    >
                      <FaEdit />
                    </Button>

                    {pendingDeleteId === item.id ? (
                      <div className={styles.confirmation}>
                        <span>Confirm delete?</span>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => confirmDelete(item.id)}
                          className={styles.deleteBtn}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={cancelDelete}
                          className={styles.cancelBtn}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => initiateDelete(item.id)}
                        className={styles.deleteBtn}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenericListManager;
