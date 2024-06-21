import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadRecords } from "../store/interactions";
import { Link } from "react-router-dom";

const ViewRecords = () => {
  const dispatch = useDispatch();
  const contract = useSelector((state) => state.medical.contract);
  const account = useSelector((state) => state.provider.account);
  const [records, setRecords] = useState([]);
  const [sortKey, setSortKey] = useState("recordId");
  const [showDeleted, setShowDeleted] = useState(false);
  const [showVerified, setShowVerified] = useState(false);
  const [showMine, setShowMine] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const sortRecords = (a, b) => {
    if (sortKey === "recordId" || sortKey === "timestamp") {
      return Number(a[sortKey]) - Number(b[sortKey]);
    } else if (sortKey === "recordDate") {
      return new Date(a.recordDate) - new Date(b.recordDate);
    }
    return 0;
  };

  const filterRecords = (record) => {
    if (showDeleted && !record.isDeleted) return false;
    if (showVerified && !record.isVerified) return false;
    if (showMine && record.verifier !== account) return false;
    return true;
  };
  const filteredRecords = records.filter((record) => {
    const staticData = parseStaticData(record.staticData);
    return (
      staticData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staticData.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staticData.DOB.includes(searchQuery) ||
      staticData.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.verifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(record.recordDate)
        .toLocaleString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

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
        <td className="px-4 py-2 border">{`${row.verifier.slice(
          0,
          5
        )}...${row.verifier.slice(-4)}`}</td>
        <td className="px-4 py-2 border">
          {new Date(row.recordDate).toLocaleString()}
        </td>

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
      <div className="mb-4 flex flex-wrap gap-4 p-4 bg-gray-100 rounded-lg shadow-md">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={() => setShowDeleted(!showDeleted)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-gray-700 font-medium">
            Only show deleted records
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showVerified}
            onChange={() => setShowVerified(!showVerified)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-gray-700 font-medium">
            Only show verified records
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showMine}
            onChange={() => setShowMine(!showMine)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-gray-700 font-medium">
            Only show my records
          </span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">Sort by:</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="form-select h-8 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recordId">Record ID</option>
            <option value="recordDate">Record Date</option>
            <option value="timestamp">Timestamp</option>
          </select>
        </label>
        <div className="mt-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="border p-2 w-full mb-4"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {account ? (
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
              {filteredRecords
                .filter(filterRecords)
                .sort(sortRecords)
                .map((row, rowIndex) => renderRow(row, rowIndex))}
            </tbody>
          </table>
        ) : (
          <h1 className="text-xl font-semibold">Connect the account</h1>
        )}
      </div>
    </div>
  );
};

export default ViewRecords;
