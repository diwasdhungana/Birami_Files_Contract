import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { loadAccount, loadProvider } from "../store/interactions";
import { useDispatch, useSelector } from "react-redux";

const Navbar = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const balance = useSelector((state) => state.provider.balance);

  const connectHandler = async () => {
    await loadAccount(provider, dispatch);
  };
  const networkHandler = async (e) => {
    const EventchainId = e.target.value;
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: `0x${EventchainId}`,
        },
      ],
    });
  };

  return (
    <nav>
      <div className="nav__networkSelector">
        <select
          name="network"
          id="network"
          onChange={networkHandler}
          defaultValue="7A69"
          // value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
        >
          <option value="" disabled>
            Select Network
          </option>
          <option value="7A69">Localhost</option>
          <option value="aa36a7">Sepolia</option>
          {/* <option value="31337">Localhost</option>
          <option value="11155111">Sepolia</option> */}
        </select>
      </div>
      {balance ? (
        <p className="nav__myBalance">
          <small>My Balance :</small>
          {Number(balance).toFixed(4)} ETH
        </p>
      ) : (
        <p className="nav__myBalance">
          <small>My Balance :</small>
          {0} ETH
        </p>
      )}
      {account ? (
        <a href="#" className="nav__myAccount">
          {account.slice(0, 5) +
            "..." +
            account.slice(account.length - 4, account.length)}
        </a>
      ) : (
        <button className="nav__balance-box" onClick={connectHandler}>
          Connect
        </button>
      )}
    </nav>
  );
};

export default Navbar;
