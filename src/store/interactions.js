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
    console.log("records loaded : ", records);
    dispatch({ type: "RECORDS_LOADED", records });
  } catch (error) {
    console.log("error loading records", error);
  }
};
export const sendRecord = async (
  staticData,
  medicalData,
  verifier,
  previousRecordId,
  provider,
  contract,
  dispatch
) => {
  let transaction;
  dispatch({ type: "SENDING_NEW_RECORD" });
  try {
    const signer = await provider.getSigner();
    transaction = await contract
      .connect(signer)
      .proposeRecord(staticData, medicalData, verifier, previousRecordId);
    transaction.wait();
    console.log("Sent record:", transaction);
    dispatch({ type: "NEW_RECORD_SUCCESS", data: transaction });
  } catch (error) {
    dispatch({ type: "SENDING_NEW_RECORD_FAILED", error });
    console.error("Failed to send record:", error);
  }
};
