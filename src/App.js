import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddRecord from "./pages/AddRecord";
import ViewRecords from "./pages/ViewRecords";
import DetailView from "./pages/DetailView";
import HomePage from "./pages/HomePage";
import { useDispatch, useSelector } from "react-redux";
import { loadContract, loadNetwork, loadProvider } from "./store/interactions";
import config from "./config.json";

function App() {
  const account = useSelector((state) => state.provider.account);
  console.log("This is account", account);
  const dispatch = useDispatch();

  const loadBlockChainData = async () => {
    const provider = loadProvider(dispatch);
    const network = await loadNetwork(provider, dispatch);
    const chainId = network.chainId;
    const medical_config = config[chainId].BiramiFiles;
    await loadContract(provider, medical_config.address, dispatch);
  };

  useEffect(() => {
    loadBlockChainData();
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-4">
          {account && (
            <ul className="flex space-x-4 mb-4">
              <li>
                <Link to="/" className="text-blue-500 hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/addRecord" className="text-blue-500 hover:underline">
                  Add Record
                </Link>
              </li>
              <li>
                <Link
                  to="/viewRecords"
                  className="text-blue-500 hover:underline"
                >
                  View Records
                </Link>
              </li>
            </ul>
          )}
          <Routes>
            <Route path="/addRecord" element={<AddRecord />} />
            <Route path="/viewRecords" element={<ViewRecords />} />
            <Route path="/detailView/:recordId" element={<DetailView />} />
            <Route path="/" exact element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
