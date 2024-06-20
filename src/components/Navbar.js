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
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold">
            BiramiFiles
          </Link>
          <div className="nav__networkSelector">
            <select
              name="network"
              id="network"
              onChange={networkHandler}
              defaultValue="7A69"
              className="bg-blue-500 text-white p-2 rounded"
            >
              <option value="" disabled>
                Select Network
              </option>
              <option value="7A69">Localhost</option>
              <option value="aa36a7">Sepolia</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {balance !== undefined ? (
            <p className="nav__myBalance">
              <small>My Balance: </small>
              {Number(balance).toFixed(4)} ETH
            </p>
          ) : (
            <p className="nav__myBalance">
              <small>My Balance: </small>0 ETH
            </p>
          )}
          {account ? (
            <a href="#" className="nav__myAccount">
              {account.slice(0, 5) + "..." + account.slice(account.length - 4)}
            </a>
          ) : (
            <button
              className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
              onClick={connectHandler}
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
