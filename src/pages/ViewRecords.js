import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadRecords } from "../store/interactions";

const ViewRecords = () => {
  const dispatch = useDispatch();
  const contract = useSelector((state) => state.medical.contract);
  const [records, setRecords] = useState([]);

  const loadInitialRecords = async () => {
    const data = await loadRecords(contract, dispatch);
    setRecords(data);
  };
  useEffect(() => {
    loadInitialRecords();
  });
  return (
    <div>
      <h1>View Records Page</h1>
      {/* Add your logic to view records here */}
    </div>
  );
};

export default ViewRecords;
