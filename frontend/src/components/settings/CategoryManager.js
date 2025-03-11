import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import GenericListManager from "./GenericListManager";
import {
  fetchCategories,
  updateCategoryThunk,
  deleteCategoryThunk,
  addCategoryThunk,
} from "../../redux/listSlice";

const CategoryManager = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.lists.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <GenericListManager
      title="Manage list of Categories"
      items={categories}
      displayProp="category"
      updateThunk={updateCategoryThunk}
      deleteThunk={deleteCategoryThunk}
      fetchThunk={fetchCategories}
      createThunk={addCategoryThunk}
    />
  );
};

export default CategoryManager;
