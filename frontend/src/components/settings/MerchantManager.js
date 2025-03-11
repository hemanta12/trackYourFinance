import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import GenericListManager from "./GenericListManager";
import {
  fetchMerchants,
  updateMerchantThunk,
  deleteMerchantThunk,
  addMerchantThunk,
} from "../../redux/listSlice";

const MerchantManager = () => {
  const dispatch = useDispatch();
  const merchants = useSelector((state) => state.lists.merchants);

  useEffect(() => {
    dispatch(fetchMerchants());
  }, [dispatch]);

  return (
    <GenericListManager
      title="Manage list of  Merchants"
      items={merchants}
      displayProp="name"
      updateThunk={updateMerchantThunk}
      deleteThunk={deleteMerchantThunk}
      fetchThunk={fetchMerchants}
      createThunk={addMerchantThunk}
    />
  );
};

export default MerchantManager;
