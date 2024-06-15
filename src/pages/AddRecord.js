import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendRecord,
  getAllVerifiedRecordsfromAddress,
  getRecordDetailById,
} from "../store/interactions";

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
  const [allergies, setAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [recordDate, setRecordDate] = useState("");

  const addMedicalDetail = () => {
    setMedicalDetails([...medicalDetails, { type: "", details: "" }]);
  };

  const removeMedicalDetail = (index) => {
    const newMedicalDetails = [...medicalDetails];
    newMedicalDetails.splice(index, 1);
    setMedicalDetails(newMedicalDetails);
  };

  const handleMedicalDetailChange = (index, field, value) => {
    const newMedicalDetails = [...medicalDetails];
    newMedicalDetails[index][field] = value;
    setMedicalDetails(newMedicalDetails);
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const removeAllergy = (index) => {
    const newAllergies = [...allergies];
    newAllergies.splice(index, 1);
    setAllergies(newAllergies);
  };

  const figureOutAllergies = (records) => {
    let allergiesArray = [];
    for (let record of records) {
      let allergies = JSON.parse(record.allergies);
      allergiesArray = allergiesArray.concat(allergies);
      console.log("Allergies : ", allergies);
    }
    console.log("All allergies : ", allergiesArray);
    return allergiesArray;
  };

  const getStaticData = async () => {
    // Placeholder function to simulate fetching data
    const previousRecordRaw = await getRecordDetailById(
      previousRecordId,
      contract,
      dispatch
    );
    if (!previousRecordRaw) {
      alert("Record not found");
      return;
    }
    const allRecordsfromAddress = await getAllVerifiedRecordsfromAddress(
      previousRecordRaw.verifier,
      contract,
      dispatch
    );
    const allergiesArray = figureOutAllergies(allRecordsfromAddress);

    // parse the static data.
    const previousRecordParsed = JSON.parse(previousRecordRaw.staticData);
    setName(previousRecordParsed.name);
    setDob(previousRecordParsed.DOB);
    setBloodType(previousRecordParsed.bloodType);
    setGender(previousRecordParsed.gender);
    setVerifier(previousRecordRaw.verifier);
    // setAllergies(JSON.parse(previousRecordRaw.allergies));
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
      instituteName,
      recordDate,
    });

    const medicalData = JSON.stringify(medicalDetails);
    const allergiesData = JSON.stringify(allergies);
    if (previousRecordId === "") {
      setPreviousRecordId(0);
    }
    // console.log("Allergies : ", allergiesData);
    await sendRecord(
      staticData,
      medicalData,
      verifier,
      previousRecordId,
      instituteName,
      allergiesData,
      recordDate,
      provider,
      contract,
      dispatch
    );
  };

  return (
    <div>
      <h1>Add Record Page</h1>
      {account ? (
        <form onSubmit={submitHandler}>
          <h1>Patient Details</h1>
          <label htmlFor="previousRecordId">Previous Record ID:</label>
          <input
            type="number"
            id="previousRecordId"
            name="previousRecordId"
            value={previousRecordId}
            onChange={(e) => {
              // also clear all the static data fields that are disabled when previousRecordId is set

              setName("");
              setDob("");
              setBloodType("");
              setGender("");
              setVerifier("");
              setAllergies([]);
              setAllergyInput("");

              setPreviousRecordId(e.target.value);
            }}
            placeholder="Leave empty for new patient record"
          />
          {previousRecordId && (
            <button type="button" onClick={getStaticData}>
              Get Static Data
            </button>
          )}

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

          <label htmlFor="instituteName">Institute Name:</label>
          <input
            type="text"
            id="instituteName"
            name="instituteName"
            value={instituteName}
            onChange={(e) => setInstituteName(e.target.value)}
            required
            placeholder="Medical Institute"
          />

          <label htmlFor="recordDate">Record Date:</label>
          <input
            type="datetime-local"
            id="recordDate"
            name="recordDate"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            required
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

          <h2>Allergies</h2>
          <input
            type="text"
            id="allergyInput"
            name="allergyInput"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            placeholder="Enter an allergy"
          />
          <button type="button" onClick={addAllergy}>
            Add Allergy
          </button>
          <div>
            {allergies.map((allergy, index) => (
              <span
                key={index}
                style={{
                  display: "inline-block",
                  margin: "5px",
                  padding: "5px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "5px",
                }}
              >
                {allergy}
                <button
                  type="button"
                  onClick={() => removeAllergy(index)}
                  style={{ marginLeft: "5px" }}
                >
                  x
                </button>
              </span>
            ))}
          </div>

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
              {medicalDetails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicalDetail(index)}
                >
                  Remove
                </button>
              )}
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
