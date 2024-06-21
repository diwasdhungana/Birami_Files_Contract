export const provider = (state = {}, action) => {
  // console.log("Reducer called with action:", action);
  switch (action.type) {
    case "CONNECTION_LOADED":
      return { ...state, connection: action.connection };
    case "NETWORK_LOADED":
      return { ...state, chainId: action.network.chainId };
    case "ACCOUNT_LOADED":
      return { ...state, account: action.account };
    case "BALANCE_LOADED":
      return { ...state, balance: action.balance };
    default:
      return state;
  }
};

export const medical = (state = {}, action) => {
  switch (action.type) {
    case "CONTRACT_LOADED":
      return { ...state, contract: action.contract };
    case "RECORDS_LOADED":
      return { ...state, records: action.records };
    case "SENDING_NEW_RECORD":
      return { ...state, sending: true };
    case "SENDING_NEW_RECORD_FAILED":
      return { ...state, sending: false, error: action.error };
    case "NEW_RECORD_SUCCESS":
      return { ...state, sending: false, newRecordData: action.data };
    case "LOADING_RECORD":
      return { ...state, loadingRecord: true };
    case "RECORD_LOADED":
      return { ...state, loadingRecord: false, record: action.record };
    case "LOADING_RECORD_DETAIL":
      return { ...state, loadingRecordDetail: true };
    case "RECORD_DETAIL_LOADED":
      return {
        ...state,
        loadingRecordDetail: false,
        recordDetail: action.record,
      };
    case "RECORD_DETAIL_LOADING_FAILED":
      return { ...state, loadingRecordDetail: false, error: action.error };
    case "LOADING_VERIFIED_RECORDS_OF_ADDRESS":
      return { ...state, loadingVerifiedRecords: true };
    case "VERIFIED_RECORDS_LOADED":
      return {
        ...state,
        loadingVerifiedRecords: false,
        verifiedRecords: action.records,
      };
    case "VERIFIED_RECORDS_LOADING_FAILED":
      return { ...state, loadingVerifiedRecords: false, error: action.error };
    case "VERIFYING_RECORD":
      return { ...state, verifyingRecord: true };
    case "RECORD_VERIFIED":
      return {
        ...state,
        verifyingRecord: false,
        verificationData: action.data,
      };
    case "VERIFYING_RECORD_FAILED":
      return { ...state, verifyingRecord: false, error: action.error };
    case "DELETING_RECORD":
      return { ...state, deletingRecord: true };
    case "RECORD_DELETED":
      return { ...state, deletingRecord: false, deletionData: action.data };
    case "DELETING_RECORD_FAILED":
      return { ...state, deletingRecord: false, error: action.error };
    default:
      return state;
  }
};
