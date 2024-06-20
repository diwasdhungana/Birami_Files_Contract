const { ethers } = require("hardhat");
const config = require("../extras/config.json");

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  const { chainId } = await ethers.provider.getNetwork();
  console.log(`Using chainId ${chainId}`);

  const [creator, verifier] = await ethers.getSigners();
  const birami = await ethers.getContractAt(
    "BiramiFiles",
    config[chainId].birami.address
  );
  console.log(`BiramiFiles smart contract fetched at ${birami.address}`);

  // Updated dummy data for records
  const recordsData = [
    {
      staticData: JSON.stringify({
        name: "John Doe",
        DOB: "1990",
        bloodType: "O+",
        gender: "Male",
      }),
      medicalData:
        '[{"type":"checkup","details":"checkup related to headache."},{"type":"medicine","details":"aspirin"}]',
      instituteName: "General Hospital",
      allergies: '["Pollen", "Dust Mites", "Pet Dander", "Mold", "Peanuts"]',
      recordDate: "2024-06-15T14:30",
    },
    {
      staticData: JSON.stringify({
        name: "Jane Doe",
        DOB: "1985",
        bloodType: "AB-",
        gender: "Female",
      }),
      medicalData:
        '[{"type":"checkup","details":"checkup related to fever and body ache."},{"type":"medicine","details":"paracetamol"}]',
      instituteName: "Medical Center",
      allergies: '["Bee Stings", "Shellfish", "Latex", "Mold", "Tree Nuts"]',
      recordDate: "2024-06-14T09:15",
    },
    {
      staticData: JSON.stringify({
        name: "Jack Smith",
        DOB: "1975",
        bloodType: "A+",
        gender: "Male",
      }),
      medicalData:
        '[{"type":"checkup","details":"checkup related to cough and cold."},{"type":"medicine","details":"cough syrup"}]',
      instituteName: "Clinic",
      allergies: "[]",
      recordDate: "2024-06-13T11:45",
    },
    // Add more records to reach 50
  ];

  // Add additional 47 dummy records with similar pattern
  for (let i = 4; i <= 50; i++) {
    recordsData.push({
      staticData: JSON.stringify({
        name: `Name ${i}`,
        DOB: `19${80 + (i % 20)}`,
        bloodType:
          i % 4 === 0 ? "A+" : i % 4 === 1 ? "B+" : i % 4 === 2 ? "O+" : "AB-",
        gender: i % 2 === 0 ? "Male" : "Female",
      }),
      medicalData: `[{"type":"checkup","details":"checkup details for record ${i}."},{"type":"medicine","details":"medicine details for record ${i}"}]`,
      instituteName: `Medical Institute ${i}`,
      allergies: `["Allergy ${i}A", "Allergy ${i}B"]`,
      recordDate: `2024-06-${10 + (i % 20)}T10:${(i % 60)
        .toString()
        .padStart(2, "0")}`,
    });
  }

  let previousRecordId = 0;

  // Propose, verify, and chain records
  for (let data of recordsData) {
    console.log(
      "all data:",
      data.staticData,
      data.medicalData,
      verifier.address,
      previousRecordId,
      data.instituteName,
      data.allergies,
      data.recordDate
    );
    let transactionResponse = await birami
      .connect(creator)
      .proposeRecord(
        data.staticData,
        data.medicalData,
        verifier.address,
        previousRecordId,
        data.instituteName,
        data.allergies,
        data.recordDate
      );
    let transactionReceipt = await transactionResponse.wait();
    console.log(
      `Record proposed. Tx hash: ${transactionReceipt.transactionHash}`
    );

    // Get the new record ID from the event
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
      Institute Name: ${record.instituteName}
      Allergies: ${record.allergies}
      Record Date: ${record.recordDate}
    `);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
