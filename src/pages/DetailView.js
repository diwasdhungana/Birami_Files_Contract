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
    // console.log("data", data.staticData);
    setRecord(data);
  };
  useEffect(() => {
    loadInitialRecord();
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    // Add logic to verify the record
    // console.log("Verify button clicked for record ID:", recordId);
    verifyRecord(recordId, contract, provider, dispatch);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    // Add logic to delete the record
    // console.log("Delete button clicked for record ID:", recordId);
    deleteRecord(recordId, contract, provider, dispatch);
  };

  if (!record) {
    return <div>Loading...</div>;
  }

  const staticData = JSON.parse(record.staticData);
  const medicalData = JSON.parse(record.medicalData);
  const allergies = JSON.parse(record.allergies);

  return (
    <div>
      <h1>Detail View Page for Record ID: {recordId}</h1>
      <div>
        <p>
          <strong>Creator:</strong> {record.creator}
        </p>
        <p>
          <strong>Previous Record ID:</strong> {Number(record.previousRecordId)}
        </p>
        <p>
          <strong>Institute Name:</strong> {record.instituteName}
        </p>
        <p>
          <strong>Record Date:</strong> {record.recordDate}
        </p>
        <h2>Static Data</h2>
        <p>
          <strong>Name:</strong> {staticData.name}
        </p>
        <p>
          <strong>DOB:</strong> {staticData.DOB}
        </p>
        <p>
          <strong>Blood Type:</strong> {staticData.bloodType}
        </p>
        <p>
          <strong>Gender:</strong> {staticData.gender}
        </p>
      </div>
      <div>
        <h2>Medical Data</h2>
        {medicalData.map((detail, index) => (
          <div key={index}>
            <p>
              <strong>Type:</strong> {detail.type}
            </p>
            <p>
              <strong>Details:</strong> {detail.details}
            </p>
          </div>
        ))}
      </div>
      <div>
        <h2>Allergies</h2>
        {allergies.map((allergy, index) => (
          <span key={index} style={{ marginRight: "10px" }}>
            {allergy}
          </span>
        ))}
      </div>
      <div>
        <h2>Other Details</h2>
        <p>
          <strong>Verifier:</strong> {record.verifier}
        </p>
        <p>
          <strong>Is Verified:</strong> {record.isVerified.toString()}
        </p>
        <p>
          <strong>Is Deleted:</strong> {record.isDeleted.toString()}
        </p>
      </div>
      {!record.isVerified && record.verifier === account && (
        <button onClick={handleVerify}>Verify</button>
      )}

      {!record.isVerified &&
        !record.isDeleted &&
        (record.creator === account || record.verifier === account) && (
          <button onClick={handleDelete}>Delete</button>
        )}
    </div>
  );
};

export default DetailView;
