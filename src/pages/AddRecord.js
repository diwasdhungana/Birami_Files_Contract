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

  // const figureOutAllergies = (records) => {
  //   const allergyCount = {};

  //   // Count the occurrences of each allergy
  //   records.forEach((record) => {
  //     JSON.parse(record.allergies).forEach((allergy) => {
  //       if (allergyCount[allergy]) {
  //         allergyCount[allergy]++;
  //       } else {
  //         allergyCount[allergy] = 1;
  //       }
  //     });
  //   });

  //   // Filter allergies that appear an odd number of times
  //   const oddAllergies = Object.keys(allergyCount).filter(
  //     (allergy) => allergyCount[allergy] % 2 !== 0
  //   );

  //   return oddAllergies;
  // };

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
    // const allRecordsfromAddress = await getAllVerifiedRecordsfromAddress(
    //   previousRecordRaw.verifier,
    //   contract,
    //   dispatch
    // );
    // const allergiesArray = figureOutAllergies(allRecordsfromAddress);
    // console.log("Allergies : ", allergiesArray);

    // parse the static data.
    const previousRecordParsed = JSON.parse(previousRecordRaw.staticData);
    setName(previousRecordParsed.name);
    setDob(previousRecordParsed.DOB);
    setBloodType(previousRecordParsed.bloodType);
    setGender(previousRecordParsed.gender);
    setVerifier(previousRecordRaw.verifier);
    console.log("Previous Record verifier : ", previousRecordRaw.verifier);
    // setAllergies(allergiesArray);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

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
    if (!isEthereumAddress(verifier)) {
      alert("Verifier is not a valid Ethereum address");
      return;
    }

    console.log(
      "all data : ",
      staticData,
      medicalData,
      verifier,
      previousRecordId,
      instituteName,
      allergiesData,
      recordDate
    );
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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Add Record Page</h1>
      {account ? (
        <form onSubmit={submitHandler} className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Patient Details</h2>
          <div>
            <label
              htmlFor="previousRecordId"
              className="block text-sm font-medium text-gray-700"
            >
              Previous Record ID:
            </label>
            <input
              type="number"
              id="previousRecordId"
              name="previousRecordId"
              value={previousRecordId}
              onChange={(e) => {
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {previousRecordId && (
              <button
                type="button"
                onClick={getStaticData}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Get Static Data
              </button>
            )}
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Patient Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jack Smith"
              disabled={previousRecordId}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700"
            >
              DOB (Year Only):
            </label>
            <input
              type="number"
              id="dob"
              name="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              placeholder="1975"
              disabled={previousRecordId}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              Gender:
            </label>
            <select
              id="gender"
              name="gender"
              onChange={(e) => setGender(e.target.value)}
              value={gender}
              required
              disabled={previousRecordId}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="bloodType"
              className="block text-sm font-medium text-gray-700"
            >
              Blood type:
            </label>
            <input
              type="text"
              id="bloodType"
              name="bloodType"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              required
              placeholder="A+"
              disabled={previousRecordId}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="instituteName"
              className="block text-sm font-medium text-gray-700"
            >
              Institute Name:
            </label>
            <input
              type="text"
              id="instituteName"
              name="instituteName"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              required
              placeholder="Medical Institute"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="recordDate"
              className="block text-sm font-medium text-gray-700"
            >
              Record Date:
            </label>
            <input
              type="datetime-local"
              id="recordDate"
              name="recordDate"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="verifier"
              className="block text-sm font-medium text-gray-700"
            >
              Verifier:
            </label>
            <input
              type="text"
              id="verifier"
              name="verifier"
              value={verifier}
              onChange={(e) => setVerifier(e.target.value)}
              required
              placeholder="0xdfdfgd"
              disabled={previousRecordId}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mt-6 mb-4">Allergies</h2>
            <input
              type="text"
              id="allergyInput"
              name="allergyInput"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              placeholder="Enter an allergy"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={addAllergy}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Add Allergy
            </button>
            <div className="mt-2">
              {allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                >
                  {allergy}
                  <button
                    type="button"
                    onClick={() => removeAllergy(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              Medical Details
            </h2>
            {medicalDetails.map((detail, index) => (
              <div key={index} className="mb-4">
                <label
                  htmlFor={`type-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Type:
                </label>
                <input
                  type="text"
                  id={`type-${index}`}
                  name={`type-${index}`}
                  value={detail.type}
                  onChange={(e) =>
                    handleMedicalDetailChange(index, "type", e.target.value)
                  }
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <label
                  htmlFor={`details-${index}`}
                  className="block text-sm font-medium text-gray-700 mt-2"
                >
                  Details:
                </label>
                <input
                  type="text"
                  id={`details-${index}`}
                  name={`details-${index}`}
                  value={detail.details}
                  onChange={(e) =>
                    handleMedicalDetailChange(index, "details", e.target.value)
                  }
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {medicalDetails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicalDetail(index)}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMedicalDetail}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Add More
            </button>
          </div>

          <div>
            <input
              type="submit"
              value="Submit"
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md"
            />
          </div>
        </form>
      ) : (
        <h1 className="text-xl font-semibold">Connect the account</h1>
      )}
    </div>
  );
};

export default AddRecord;
