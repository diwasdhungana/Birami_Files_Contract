const { ethers } = require("hardhat");
const config = require("../extras/config.json");

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  const { chainId } = await ethers.provider.getNetwork();
  console.log(`Using chainId ${chainId}`);

  const [creator, verifier, extra] = await ethers.getSigners();
  const birami = await ethers.getContractAt(
    "BiramiFiles",
    config[chainId].birami.address
  );
  console.log(`BiramiFiles smart contract fetched at ${birami.address}`);

  // Dummy data for records
  const recordsData = [
    {
      staticData: JSON.stringify({
        name: "John Doe",
        DOB: "1990-01-01",
        bloodType: "O+",
        gender: "Male",
      }),
      medicalData: "No known medical conditions",
    },
    {
      staticData: JSON.stringify({
        name: "Jane Doe",
        DOB: "1985-05-15",
        bloodType: "AB-",
        gender: "Female",
      }),
      medicalData: "Hypertension",
    },
    {
      staticData: JSON.stringify({
        name: "Jack Smith",
        DOB: "1975-12-30",
        bloodType: "A+",
        gender: "Male",
      }),
      medicalData: "Diabetes",
    },
  ];

  let previousRecordId = 0;

  // Propose, verify, and chain records
  for (let data of recordsData) {
    console.log(`Proposing record with static data: ${data.staticData}...`);
    let transactionResponse = await birami.connect(creator).proposeRecord(
      data.staticData,
      data.medicalData,
      verifier.address,
      previousRecordId // Chain the records
    );
    let transactionReceipt = await transactionResponse.wait();
    console.log(
      `Record proposed. Tx hash: ${transactionReceipt.transactionHash}`
    );

    // Get the new record ID from the event
    console.log("from here", transactionReceipt);
    const event = transactionReceipt.events.find(
      (event) => event.event === "RecordProposed"
    );
    previousRecordId = event.args.recordId;

    console.log(`Verifying record ${previousRecordId}...`);
    transactionResponse = await birami
      .connect(verifier)
      .verifyRecord(previousRecordId);
    transactionReceipt = await transactionResponse.wait();
    console.log(
      `Record ${previousRecordId} verified. Tx hash: ${transactionReceipt.transactionHash}`
    );

    // Wait for 1 second between transactions to avoid chain congestion
    await wait(1);
  }

  // Retrieve and log the chain of records for the last record
  const finalRecordId = previousRecordId;
  const chainOfRecords = await birami.getChainOfRecords(finalRecordId);
  console.log("Chain of Records:");
  for (const record of chainOfRecords) {
    console.log(`
      Record ID: ${record.recordId}
      Previous Record ID: ${record.previousRecordId}
      Timestamp: ${record.timestamp}
      Static Data: ${record.staticData}
      Medical Data: ${record.medicalData}
      Creator: ${record.creator}
      Verifier: ${record.verifier}
      Is Verified: ${record.isVerified}
      Is Deleted: ${record.isDeleted}
    `);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
