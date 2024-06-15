export const provider = (state = {}, action) => {
  // console.log("Reducer called with action:", action);
  switch (action.type) {
    case "CONNECTION_LOADED":
      return { ...state, connection: action.connection };
    case "NETWORK_LOADED":
      return { ...state, chainId: action.network.chainId }; // Note: action.chainId was replaced with action.network.chainId
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
    default:
      return state;
  }
};
