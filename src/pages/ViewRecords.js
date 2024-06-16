import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadRecords } from "../store/interactions";
import { Link } from "react-router-dom";

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
  const parseStaticData = (staticData) => {
    const parsed = JSON.parse(staticData);
    return {
      name: parsed.name,
      gender: parsed.gender,
      DOB: parsed.DOB,
      bloodType: parsed.bloodType,
    };
  };

  const renderRow = (row, rowIndex) => {
    const staticData = parseStaticData(row.staticData);
    return (
      <tr
        key={rowIndex}
        style={{ backgroundColor: row.isDeleted ? "red" : "white" }}
      >
        <td>{Number(row.recordId)}</td>
        <td>{staticData.name}</td>
        <td>{staticData.gender}</td>
        <td>{staticData.DOB}</td>
        <td>{staticData.bloodType}</td>
        <td>{row.instituteName}</td>
        <td>{row.verifier}</td>
        <td>{row.recordDate}</td>
        <td
          style={{
            backgroundColor: row.isVerified ? "green" : "transparent",
            color: row.isVerified ? "white" : "black",
          }}
        >
          {row.isVerified.toString()}
        </td>
        <td>{row.isDeleted.toString()}</td>
        <td>
          <Link to={`/detailView/${row.recordId}`}>View Detail</Link>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            <th>Record Id</th>
            <th>Name</th>
            <th>Gender</th>
            <th>DOB</th>
            <th>Blood Type</th>
            <th>Institute Name</th>
            <th>Verifier's Address</th>
            <th>Record Date</th>
            <th>Is Verified</th>
            <th>Is Deleted</th>
          </tr>
        </thead>
        <tbody>
          {records.map((row, rowIndex) => renderRow(row, rowIndex))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewRecords;
