import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import GenericListManager from "./GenericListManager";
import {
  fetchSources,
  updateSourceThunk,
  deleteSourceThunk,
  addSourceThunk,
} from "../../redux/listSlice";

const SourceManager = () => {
  const dispatch = useDispatch();
  const sources = useSelector((state) => state.lists.sources);

  useEffect(() => {
    dispatch(fetchSources());
  }, [dispatch]);

  return (
    <GenericListManager
      title="Manage list of Sources"
      items={sources}
      displayProp="source"
      updateThunk={updateSourceThunk}
      deleteThunk={deleteSourceThunk}
      fetchThunk={fetchSources}
      createThunk={addSourceThunk}
    />
  );
};

export default SourceManager;
