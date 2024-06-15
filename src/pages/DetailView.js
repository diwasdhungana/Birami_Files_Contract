import React from "react";
import { useParams } from "react-router-dom";

const DetailView = () => {
  const { contractId } = useParams();
  return (
    <div>
      <h1>Detail View Page for Contract ID: {contractId}</h1>
      {/* Add your logic to display details of a specific record here */}
    </div>
  );
};

export default DetailView;
