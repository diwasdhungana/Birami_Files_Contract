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
  }, [contract, dispatch]);

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
        className={`${
          row.isDeleted ? "bg-red-200" : "bg-white"
        } hover:bg-gray-100`}
      >
        <td className="px-4 py-2 border">{Number(row.recordId)}</td>
        <td className="px-4 py-2 border">{staticData.name}</td>
        <td className="px-4 py-2 border">{staticData.gender}</td>
        <td className="px-4 py-2 border">{staticData.DOB}</td>
        <td className="px-4 py-2 border">{staticData.bloodType}</td>
        <td className="px-4 py-2 border">{row.instituteName}</td>
        <td className="px-4 py-2 border">{row.verifier}</td>
        <td className="px-4 py-2 border">{row.recordDate}</td>
        <td
          className={`px-4 py-2 border ${
            row.isVerified ? "bg-green-500 text-white" : ""
          }`}
        >
          {row.isVerified.toString()}
        </td>
        <td className="px-4 py-2 border">{row.isDeleted.toString()}</td>
        <td className="px-4 py-2 border">
          <Link
            to={`/detailView/${row.recordId}`}
            className="text-blue-500 hover:underline"
          >
            View Detail
          </Link>
        </td>
      </tr>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">View Records</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr>
              {[
                "Record Id",
                "Name",
                "Gender",
                "DOB",
                "Blood Type",
                "Institute Name",
                "Verifier's Address",
                "Record Date",
                "Is Verified",
                "Is Deleted",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 border-b-2 border-gray-300 bg-gray-100 text-left text-sm font-semibold text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((row, rowIndex) => renderRow(row, rowIndex))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewRecords;
