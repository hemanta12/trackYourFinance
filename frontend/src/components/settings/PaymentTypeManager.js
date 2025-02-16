import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import GenericListManager from "./GenericListManager";
import {
  fetchPaymentTypes,
  updatePaymentTypeThunk,
  deletePaymentTypeThunk,
} from "../../redux/listSlice";

const PaymentTypeManager = () => {
  const dispatch = useDispatch();
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);

  useEffect(() => {
    dispatch(fetchPaymentTypes());
  }, [dispatch]);

  return (
    <GenericListManager
      title="Manage list of Payment Types"
      items={paymentTypes}
      displayProp="payment_type"
      paramName="paymentType"
      updateThunk={updatePaymentTypeThunk}
      deleteThunk={deletePaymentTypeThunk}
      fetchThunk={fetchPaymentTypes}
    />
  );
};

export default PaymentTypeManager;
