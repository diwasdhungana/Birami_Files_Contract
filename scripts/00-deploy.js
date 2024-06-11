const { ethers } = require("hardhat");
async function main() {
  console.log("Deploying smart contract...");
  const BiramiFiles = await ethers.getContractFactory("BiramiFiles");
  const account = await ethers.getSigners();
  const birami = await BiramiFiles.connect(account[1]).deploy();
  await birami.deployed();
  console.log(`Birami is deployed in address ${birami.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
