import { ethers } from "ethers";
import abi from "../abis/BiramiFiles.json";

export const loadProvider = (dispatch) => {
  const connection = new ethers.providers.Web3Provider(window.ethereum);
  dispatch({ type: "CONNECTION_LOADED", connection });
  return connection;
};

export const loadNetwork = async (provider, dispatch) => {
  const network = await provider.getNetwork();
  dispatch({ type: "NETWORK_LOADED", network });
  return network;
};

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch({ type: "ACCOUNT_LOADED", account });
  let balance = await provider.getBalance(account);
  balance = ethers.utils.formatEther(balance);
  dispatch({ type: "BALANCE_LOADED", balance });
  return account;
};

export const loadContract = async (provider, contractAddress, dispatch) => {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  dispatch({ type: "CONTRACT_LOADED", contract });
  return contract;
};

export const loadRecords = async (contract, dispatch) => {
  try {
    const records = await contract.getAllRecords();
    // console.log("records loaded : ", records);
    dispatch({ type: "RECORDS_LOADED", records });
    return records;
  } catch (error) {
    console.log("error loading records", error);
  }
};

export const loadRecord = async (recordId, contract, dispatch) => {
  try {
    dispatch({ type: "LOADING_RECORD" });
    const record = await contract.getRecord(recordId);
    dispatch({ type: "RECORD_LOADED", record });
    return record;
  } catch (error) {
    console.log("error loading record", error);
  }
};

export const sendRecord = async (
  staticData,
  medicalData,
  verifier,
  previousRecordId,
  instituteName,
  allergies,
  recordDate,
  provider,
  contract,
  dispatch
) => {
  dispatch({ type: "SENDING_NEW_RECORD" });
  try {
    const signer = await provider.getSigner();
    const transaction = await contract
      .connect(signer)
      .proposeRecord(
        staticData,
        medicalData,
        verifier,
        previousRecordId,
        instituteName,
        allergies,
        recordDate
      );
    await transaction.wait();
    console.log("Sent record:", transaction);
    dispatch({ type: "NEW_RECORD_SUCCESS", data: transaction });
  } catch (error) {
    dispatch({ type: "SENDING_NEW_RECORD_FAILED", error });
    console.error("Failed to send record:", error);
  }
};
export const getRecordDetailById = async (recordId, contract, dispatch) => {
  try {
    dispatch({ type: "LOADING_RECORD_DETAIL" });
    const record = await contract.getRecord(recordId);
    if (record.staticData === "") {
      return null;
    }
    dispatch({ type: "RECORD_DETAIL_LOADED", record });
    return record;
  } catch (error) {
    console.log("error loading record detail", error);
    dispatch({ type: "RECORD_DETAIL_LOADING_FAILED", error });
  }
};

export const getAllVerifiedRecordsfromAddress = async (
  address,
  contract,
  dispatch
) => {
  try {
    dispatch({ type: "LOADING_VERIFIED_RECORDS_OF_ADDRESS" });
    const records = await contract.getRecordsVerifiedBy(address);
    dispatch({ type: "VERIFIED_RECORDS_LOADED", records });
    // console.log("verified records loaded : ", records);
    return records;
  } catch (error) {
    console.log("error loading verified records", error);
    dispatch({ type: "VERIFIED_RECORDS_LOADING_FAILED", error });
  }
};

export const verifyRecord = async (recordId, contract, provider, dispatch) => {
  let transaction;
  dispatch({ type: "VERIFYING_RECORD" });
  try {
    const signer = await provider.getSigner();
    transaction = await contract.connect(signer).verifyRecord(recordId);
    transaction.wait();
    console.log("Verified record:", transaction);
    dispatch({ type: "RECORD_VERIFIED", data: transaction });
  } catch (error) {
    dispatch({ type: "VERIFYING_RECORD_FAILED", error });
    console.error("Failed to verify record:", error);
  }
};

export const deleteRecord = async (recordId, contract, provider, dispatch) => {
  let transaction;
  dispatch({ type: "DELETING_RECORD" });
  try {
    const signer = await provider.getSigner();
    transaction = await contract.connect(signer).deleteRecord(recordId);
    transaction.wait();
    console.log("Deleted record:", transaction);
    dispatch({ type: "RECORD_DELETED", data: transaction });
  } catch (error) {
    dispatch({ type: "DELETING_RECORD_FAILED", error });
    console.error("Failed to delete record:", error);
  }
};
