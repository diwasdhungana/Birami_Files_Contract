import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadRecord, verifyRecord, deleteRecord } from "../store/interactions";

const DetailView = () => {
  const dispatch = useDispatch();
  const { recordId } = useParams();
  const contract = useSelector((state) => state.medical.contract);
  const account = useSelector((state) => state.provider.account);
  const provider = useSelector((state) => state.provider.connection);
  const [record, setRecord] = useState();

  const loadInitialRecord = async () => {
    const data = await loadRecord(recordId, contract, dispatch);
    setRecord(data);
  };

  useEffect(() => {
    loadInitialRecord();
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    verifyRecord(recordId, contract, provider, dispatch);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    deleteRecord(recordId, contract, provider, dispatch);
  };

  if (!record) {
    return <div className="text-center">Loading...</div>;
  }

  const staticData = JSON.parse(record.staticData);
  const medicalData = JSON.parse(record.medicalData);
  const allergies = JSON.parse(record.allergies);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        Detail View for Record ID: {recordId}
      </h1>
      <div className="bg-white shadow-md rounded p-4 mb-4">
        <p className="mb-2">
          <strong>Creator:</strong> {record.creator}
        </p>
        <p className="mb-2">
          <strong>Previous Record ID:</strong> {Number(record.previousRecordId)}
        </p>
        <p className="mb-2">
          <strong>Institute Name:</strong> {record.instituteName}
        </p>
        <p className="mb-2">
          <strong>Record Date:</strong> {record.recordDate}
        </p>
        <h2 className="text-2xl font-semibold mt-4 mb-2">Static Data</h2>
        <p className="mb-2">
          <strong>Name:</strong> {staticData.name}
        </p>
        <p className="mb-2">
          <strong>DOB:</strong> {staticData.DOB}
        </p>
        <p className="mb-2">
          <strong>Blood Type:</strong> {staticData.bloodType}
        </p>
        <p className="mb-2">
          <strong>Gender:</strong> {staticData.gender}
        </p>
      </div>
      <div className="bg-white shadow-md rounded p-4 mb-4">
        <h2 className="text-2xl font-semibold mb-2">Medical Data</h2>
        {medicalData.map((detail, index) => (
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
      <div className="bg-white shadow-md rounded p-4 mb-4">
        <h2 className="text-2xl font-semibold mb-2">Allergies</h2>
        {allergies.map((allergy, index) => (
          <span
            key={index}
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          >
            {allergy}
          </span>
        ))}
      </div>
      <div className="bg-white shadow-md rounded p-4 mb-4">
        <h2 className="text-2xl font-semibold mb-2">Other Details</h2>
        <p className="mb-2">
          <strong>Verifier:</strong> {record.verifier}
        </p>
        <p className="mb-2">
          <strong>Is Verified:</strong> {record.isVerified.toString()}
        </p>
        <p className="mb-2">
          <strong>Is Deleted:</strong> {record.isDeleted.toString()}
        </p>
      </div>
      <div className="flex space-x-4">
        {!record.isVerified && record.verifier === account && (
          <button
            onClick={handleVerify}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Verify
          </button>
        )}
        {!record.isVerified &&
          !record.isDeleted &&
          (record.creator === account || record.verifier === account) &&
          !record.isVerified && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
      </div>
    </div>
  );
};

export default DetailView;
