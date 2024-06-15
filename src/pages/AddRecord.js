import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendRecord } from "../store/interactions";

// Utility function to check if a string is a valid Ethereum address
const isEthereumAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

const AddRecord = () => {
  const account = useSelector((state) => state.provider.account);
  const provider = useSelector((state) => state.provider.connection);
  const contract = useSelector((state) => state.medical.contract);
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [gender, setGender] = useState("");
  const [verifier, setVerifier] = useState("");
  const [medicalDetails, setMedicalDetails] = useState([
    { type: "", details: "" },
  ]);
  const [previousRecordId, setPreviousRecordId] = useState("");

  const addMedicalDetail = () => {
    setMedicalDetails([...medicalDetails, { type: "", details: "" }]);
  };

  const handleMedicalDetailChange = (index, field, value) => {
    const newMedicalDetails = [...medicalDetails];
    newMedicalDetails[index][field] = value;
    setMedicalDetails(newMedicalDetails);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!isEthereumAddress(verifier)) {
      alert("Verifier is not a valid Ethereum address");
      return;
    }

    const staticData = JSON.stringify({
      name,
      DOB: dob,
      bloodType,
      gender,
    });

    const medicalData = JSON.stringify(medicalDetails);

    // const output = {
    //   staticData,
    //   medicalData,
    //   verifier,
    //   previousRecordId: previousRecordId ? previousRecordId : 0,
    // };
    setPreviousRecordId(previousRecordId ? previousRecordId : 0);

    await sendRecord(
      staticData,
      medicalData,
      verifier,
      previousRecordId,
      provider,
      contract,
      dispatch
    );

    // console.log(output);
  };

  return (
    <div>
      <h1>Add Record Page</h1>
      {account ? (
        <form onSubmit={submitHandler}>
          <h1>Patient Details</h1>
          <label htmlFor="name">Previous Record ID:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={previousRecordId}
            onChange={(e) => setPreviousRecordId(e.target.value)}
            placeholder="0 (for new record)"
          />
          <label htmlFor="name">Patient Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jack Smith"
            disabled={previousRecordId}
          />

          <label htmlFor="dob">DOB (Year Only):</label>
          <input
            type="number"
            id="dob"
            name="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            placeholder="1975"
            disabled={previousRecordId}
          />

          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            onChange={(e) => setGender(e.target.value)}
            value={gender}
            required
            disabled={previousRecordId}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="bloodType">Blood type:</label>
          <input
            type="text"
            id="bloodType"
            name="bloodType"
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            required
            placeholder="A+"
            disabled={previousRecordId}
          />

          <label htmlFor="verifier">Verifier:</label>
          <input
            type="text"
            id="verifier"
            name="verifier"
            value={verifier}
            onChange={(e) => setVerifier(e.target.value)}
            required
            placeholder="0xdfdfgd"
            disabled={previousRecordId}
          />

          <h2>Medical Details</h2>
          {medicalDetails.map((detail, index) => (
            <div key={index}>
              <label htmlFor={`type-${index}`}>Type:</label>
              <input
                type="text"
                id={`type-${index}`}
                name={`type-${index}`}
                value={detail.type}
                onChange={(e) =>
                  handleMedicalDetailChange(index, "type", e.target.value)
                }
                required
              />

              <label htmlFor={`details-${index}`}>Details:</label>
              <input
                type="text"
                id={`details-${index}`}
                name={`details-${index}`}
                value={detail.details}
                onChange={(e) =>
                  handleMedicalDetailChange(index, "details", e.target.value)
                }
                required
              />
            </div>
          ))}

          <button type="button" onClick={addMedicalDetail}>
            Add More
          </button>

          <input type="submit" value="Submit" />
        </form>
      ) : (
        <h1>Connect the account</h1>
      )}
    </div>
  );
};

export default AddRecord;
