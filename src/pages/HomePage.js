import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to BiramiFiles</h1>
        <p className="text-lg mb-6">
          BiramiFiles is a secure and decentralized platform for managing and
          verifying medical records. Our system ensures data integrity and
          confidentiality, empowering patients and healthcare providers alike.
        </p>
        <div className="flex justify-around mb-4">
          <Link
            to="/addRecord"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-800"
          >
            Add New Record
          </Link>
          <Link
            to="/viewRecords"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-800"
          >
            View Records
          </Link>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-2">Our Features</h2>
          <ul className="list-disc list-inside text-left mx-auto max-w-lg">
            <li className="mb-2">
              Decentralized storage of medical records on the blockchain.
            </li>
            <li className="mb-2">Secure and verifiable data transactions.</li>
            <li className="mb-2">
              Easy access for both patients and healthcare providers.
            </li>
            <li className="mb-2">
              Detailed audit trails and history of records.
            </li>
            <li className="mb-2">
              Support for multiple record types and data formats.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
