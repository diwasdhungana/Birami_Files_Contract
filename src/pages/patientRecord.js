import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllVerifiedRecordsfromAddress,
  getRecordDetailById,
} from "../store/interactions";

const PatientDetails = () => {
  const dispatch = useDispatch();
  const contract = useSelector((state) => state.medical.contract);
  const [previousId, setPreviousId] = useState("");
  const [verifier, setVerifier] = useState("");
  const [records, setRecords] = useState([]);
  const [staticData, setStaticData] = useState({});
  const [allergies, setAllergies] = useState([]);

  const handlePreviousIdSubmit = async (e) => {
    e.preventDefault();
    const previousRecordRaw = await getRecordDetailById(
      previousId,
      contract,
      dispatch
    );
    if (!previousRecordRaw) {
      alert("Record not found");
      return;
    }
    if (previousRecordRaw) {
      setVerifier(previousRecordRaw.verifier);
      loadPatientRecords(previousRecordRaw.verifier);
    }
  };

  const handleVerifierSubmit = async (e) => {
    e.preventDefault();
    loadPatientRecords(verifier);
  };

  const loadPatientRecords = async (verifierAddress) => {
    const data = await getAllVerifiedRecordsfromAddress(
      verifierAddress,
      contract,
      dispatch
    );
    if (data.length > 0) {
      const parsedStaticData = JSON.parse(data[0].staticData);
      setStaticData(parsedStaticData);
      setAllergies(parseAllergies(data));
      //   setRecords(
      //     data.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate))
      //   );
      setRecords(data);
    }
  };

  const parseAllergies = (records) => {
    const allAllergies = records.flatMap((record) =>
      JSON.parse(record.allergies)
    );
    return [...new Set(allAllergies)]; // Remove duplicates
  };

  const renderRecord = (record, index) => (
    <div key={index} className="border rounded-lg p-4 mb-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleCollapse(index)}
      >
        <span>{record.instituteName}</span>
        <span>{Number(record.recordId)}</span>
        <span>{new Date(record.recordDate).toLocaleString()}</span>
      </div>
      {record.isExpanded && (
        <div className="mt-4">
          {/* <p>
            <strong>Timestamp:</strong> {record.timestamp}
          </p> */}
          <p>
            <strong>Creator:</strong> {record.creator}
          </p>
          <div className="bg-white shadow-md rounded p-4 mb-4">
            <h2 className="text-2xl font-semibold mb-2">Medical Data</h2>
            {JSON.parse(record.medicalData).map((detail, index) => (
              <div key={index} className="mb-2">
                <p className="mb-1">
                  <strong>Type:</strong> {detail.type}
                </p>
                <p className="mb-1">
                  <strong>Details:</strong> {detail.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const toggleCollapse = (index) => {
    setRecords(
      records.map((record, i) =>
        i === index ? { ...record, isExpanded: !record.isExpanded } : record
      )
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Patient Details</h1>
      <form onSubmit={handlePreviousIdSubmit} className="mb-4">
        <label className="block mb-2">Enter Patient's Previous ID:</label>
        <input
          type="text"
          value={previousId}
          onChange={(e) => setPreviousId(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit
        </button>
      </form>
      <form onSubmit={handleVerifierSubmit} className="mb-4">
        <label className="block mb-2">Enter Verifier Address:</label>
        <input
          type="text"
          value={verifier}
          onChange={(e) => setVerifier(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit
        </button>
      </form>
      {staticData.name && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Static Data</h2>
          <p>
            <strong>Name:</strong> {staticData.name}
          </p>
          <p>
            <strong>Gender:</strong> {staticData.gender}
          </p>
          <p>
            <strong>DOB:</strong> {staticData.DOB}
          </p>
          <p>
            <strong>Blood Type:</strong> {staticData.bloodType}
          </p>
        </div>
      )}
      {allergies.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Allergies</h2>
          <p>{allergies.join(", ")}</p>
        </div>
      )}
      {records.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold mb-4">Records</h2>
          {records.map((record, index) => renderRecord(record, index))}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mt-5">No Verified Records Found.</h2>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
