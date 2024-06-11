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
      name: "John Doe",
      DOB: "1990-01-01",
      bloodType: "O+",
      gender: "Male",
      medicalData: "No known medical conditions",
    },
    {
      name: "Jane Doe",
      DOB: "1985-05-15",
      bloodType: "AB-",
      gender: "Female",
      medicalData: "Hypertension",
    },
    {
      name: "Jack Smith",
      DOB: "1975-12-30",
      bloodType: "A+",
      gender: "Male",
      medicalData: "Diabetes",
    },
  ];

  // Propose records
  for (let data of recordsData) {
    console.log(`Proposing record for ${data.name}...`);
    transactionResponse = await birami.proposeRecord(
      data.name,
      data.DOB,
      data.bloodType,
      data.gender,
      data.medicalData,
      verifier.address
    );
    transactionReceipt = await transactionResponse.wait();
    console.log(
      `Record proposed for ${data.name}. Tx hash: ${transactionReceipt.transactionHash}`
    );

    // Wait for 1 second between transactions to avoid chain congestion
    await wait(1);
  }

  // Verify records
  for (let i = 1; i <= recordsData.length; i++) {
    console.log(`Verifying record ${i}...`);
    transactionResponse = await birami.connect(verifier).verifyRecord(i);
    transactionReceipt = await transactionResponse.wait();
    console.log(
      `Record ${i} verified. Tx hash: ${transactionReceipt.transactionHash}`
    );

    // Wait for 1 second between transactions to avoid chain congestion
    await wait(1);
  }

  // Delete records (by creator or verifier)
  for (let i = 1; i <= recordsData.length; i++) {
    console.log(`Deleting record ${i}...`);
    transactionResponse = await birami.deleteRecord(i);
    transactionReceipt = await transactionResponse.wait();
    console.log(
      `Record ${i} deleted. Tx hash: ${transactionReceipt.transactionHash}`
    );

    // Wait for 1 second between transactions to avoid chain congestion
    await wait(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
