const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BiramiFiles", () => {
  let creator,
    verifier,
    unknown,
    biramiFiles,
    transactionResponse,
    transactionReceipt;

  beforeEach(async () => {
    [creator, verifier, unknown] = await ethers.getSigners();
    const BiramiFiles = await ethers.getContractFactory("BiramiFiles");
    biramiFiles = await BiramiFiles.connect(creator).deploy();
  });

  describe("Deployment", () => {
    it("should deploy the contract successfully", async () => {
      expect(await biramiFiles.address).to.not.equal(0);
    });
  });

  describe("Propose Record", () => {
    const staticData = JSON.stringify({
      name: "John Doe",
      DOB: "1990-01-01",
      bloodType: "O+",
      gender: "Male",
    });
    const medicalData = "No known medical conditions";

    beforeEach(async () => {
      transactionResponse = await biramiFiles.proposeRecord(
        staticData,
        medicalData,
        verifier.address,
        0 // No previous record
      );
      transactionReceipt = await transactionResponse.wait();
    });

    it("should store the record correctly", async () => {
      const recordId = await biramiFiles.recordId();
      const record = await biramiFiles.getRecord(recordId);

      expect(record.recordId).to.equal(recordId);
      expect(record.staticData).to.equal(staticData);
      expect(record.medicalData).to.equal(medicalData);
      expect(record.creator).to.equal(creator.address);
      expect(record.verifier).to.equal(verifier.address);
      expect(record.isVerified).to.equal(false);
      expect(record.isDeleted).to.equal(false);
      expect(record.previousRecordId).to.equal(0);
    });

    it("should emit a RecordProposed event", async () => {
      const event = transactionReceipt.events[0];
      expect(event.event).to.equal("RecordProposed");
      expect(event.args.recordId).to.equal(await biramiFiles.recordId());
      expect(event.args.staticData).to.equal(staticData);
      expect(event.args.medicalData).to.equal(medicalData);
      expect(event.args.creator).to.equal(creator.address);
      expect(event.args.verifier).to.equal(verifier.address);
      expect(event.args.previousRecordId).to.equal(0);
    });

    it("should handle proposing a record with a previous record", async () => {
      const newStaticData = JSON.stringify({
        name: "Jane Doe",
        DOB: "1985-05-15",
        bloodType: "AB-",
        gender: "Female",
      });
      const newMedicalData = "Hypertension";

      const previousRecordId = await biramiFiles.recordId();
      await biramiFiles.connect(verifier).verifyRecord(previousRecordId);

      const newTransactionResponse = await biramiFiles.proposeRecord(
        newStaticData,
        newMedicalData,
        verifier.address,
        previousRecordId
      );
      const newTransactionReceipt = await newTransactionResponse.wait();
      const newRecordId = await biramiFiles.recordId();
      const newRecord = await biramiFiles.getRecord(newRecordId);

      expect(newRecord.previousRecordId).to.equal(previousRecordId);
    });

    it("should revert if previousRecordId is invalid", async () => {
      const invalidStaticData = JSON.stringify({
        name: "Jane Doe",
        DOB: "1985-05-15",
        bloodType: "AB-",
        gender: "Female",
      });
      const invalidMedicalData = "Hypertension";

      await expect(
        biramiFiles.proposeRecord(
          invalidStaticData,
          invalidMedicalData,
          verifier.address,
          999
        )
      ).to.be.revertedWith("Invalid previousRecordId");
    });
  });

  describe("Verify Record", () => {
    let recordId;

    beforeEach(async () => {
      const staticData = JSON.stringify({
        name: "Jane Doe",
        DOB: "1985-05-15",
        bloodType: "AB-",
        gender: "Female",
      });
      const medicalData = "Hypertension";

      await biramiFiles.proposeRecord(
        staticData,
        medicalData,
        verifier.address,
        0
      );
      recordId = await biramiFiles.recordId();
    });

    it("should verify a record", async () => {
      await biramiFiles.connect(verifier).verifyRecord(recordId);
      const record = await biramiFiles.getRecord(recordId);
      expect(record.isVerified).to.equal(true);
    });

    it("should emit a RecordVerified event", async () => {
      const verifyTx = await biramiFiles
        .connect(verifier)
        .verifyRecord(recordId);
      const verifyTxTemp = await verifyTx.wait();
      const event = verifyTxTemp.events.find(
        (event) => event.event === "RecordVerified"
      );
      expect(event).to.not.be.undefined;
      expect(event.args.recordId).to.equal(recordId);
      expect(event.args.verifier).to.equal(verifier.address);
    });

    it("should not allow non-verifiers to verify a record", async () => {
      await expect(
        biramiFiles.connect(creator).verifyRecord(recordId)
      ).to.be.revertedWith("Only designated verifier can verify");
    });

    it("should not allow re-verification of a record", async () => {
      await biramiFiles.connect(verifier).verifyRecord(recordId);
      await expect(
        biramiFiles.connect(verifier).verifyRecord(recordId)
      ).to.be.revertedWith("Record already verified");
    });
  });

  describe("Delete Record", () => {
    let recordId;

    beforeEach(async () => {
      const staticData = JSON.stringify({
        name: "Jack Smith",
        DOB: "1975-12-30",
        bloodType: "A+",
        gender: "Male",
      });
      const medicalData = "Diabetes";

      await biramiFiles.proposeRecord(
        staticData,
        medicalData,
        verifier.address,
        0
      );
      recordId = await biramiFiles.recordId();
      await biramiFiles.connect(verifier).verifyRecord(recordId);
    });

    it("should delete a record", async () => {
      await biramiFiles.deleteRecord(recordId);
      const record = await biramiFiles.getRecord(recordId);
      expect(record.isDeleted).to.equal(true);
    });

    it("should emit a RecordDeleted event", async () => {
      const deleteTx = await biramiFiles.deleteRecord(recordId);
      const promised = await deleteTx.wait();
      const event = promised.events.find(
        (event) => event.event === "RecordDeleted"
      );
      expect(event).to.not.be.undefined;
      expect(event.args.recordId).to.equal(recordId);
      expect(event.args.deletedBy).to.equal(creator.address);
    });

    it("should not allow non-creators or non-verifiers to delete a record", async () => {
      await expect(
        biramiFiles.connect(unknown).deleteRecord(recordId)
      ).to.be.revertedWith("Not authorized to delete");
    });

    it("should not allow re-deletion of a record", async () => {
      await biramiFiles.deleteRecord(recordId);
      await expect(biramiFiles.deleteRecord(recordId)).to.be.revertedWith(
        "Record already deleted"
      );
    });
  });

  describe("getVerifiedRecords", () => {
    it("should return all verified records", async () => {
      const staticData1 = JSON.stringify({
        name: "Name1",
        DOB: "DOB1",
        bloodType: "O+",
        gender: "Male",
      });
      const staticData2 = JSON.stringify({
        name: "Name2",
        DOB: "DOB2",
        bloodType: "A+",
        gender: "Female",
      });
      const staticData3 = JSON.stringify({
        name: "Name3",
        DOB: "DOB3",
        bloodType: "B+",
        gender: "Male",
      });

      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData1, "MedicalData1", verifier.address, 0);
      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData2, "MedicalData2", verifier.address, 0);
      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData3, "MedicalData3", verifier.address, 0);

      await biramiFiles.connect(verifier).verifyRecord(1);
      await biramiFiles.connect(verifier).verifyRecord(3);

      const verifiedRecords = await biramiFiles.getVerifiedRecords();
      expect(verifiedRecords.length).to.equal(2);
      expect(verifiedRecords[0].recordId).to.equal(1);
      expect(verifiedRecords[1].recordId).to.equal(3);
    });
  });

  describe("getRecordsToVerify", () => {
    it("should return all records to be verified by a specific verifier", async () => {
      const staticData1 = JSON.stringify({
        name: "Name1",
        DOB: "DOB1",
        bloodType: "O+",
        gender: "Male",
      });
      const staticData2 = JSON.stringify({
        name: "Name2",
        DOB: "DOB2",
        bloodType: "A+",
        gender: "Female",
      });
      const staticData3 = JSON.stringify({
        name: "Name3",
        DOB: "DOB3",
        bloodType: "B+",
        gender: "Male",
      });

      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData1, "MedicalData1", verifier.address, 0);
      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData2, "MedicalData2", verifier.address, 0);
      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData3, "MedicalData3", verifier.address, 0);

      await biramiFiles.connect(verifier).verifyRecord(1);

      const recordsToVerify = await biramiFiles.getRecordsToVerify(
        verifier.address
      );
      expect(recordsToVerify.length).to.equal(2);
      expect(recordsToVerify[0].recordId).to.equal(2);
      expect(recordsToVerify[1].recordId).to.equal(3);
    });
  });

  describe("getRecordsByCreator", () => {
    it("should return all records created by a specific creator", async () => {
      const staticData1 = JSON.stringify({
        name: "Name1",
        DOB: "DOB1",
        bloodType: "O+",
        gender: "Male",
      });
      const staticData2 = JSON.stringify({
        name: "Name2",
        DOB: "DOB2",
        bloodType: "A+",
        gender: "Female",
      });

      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData1, "MedicalData1", verifier.address, 0);
      await biramiFiles
        .connect(unknown)
        .proposeRecord(staticData2, "MedicalData2", verifier.address, 0);

      const recordsByCreator = await biramiFiles.getRecordsByCreator(
        creator.address
      );
      expect(recordsByCreator.length).to.equal(1);
      expect(recordsByCreator[0].recordId).to.equal(1);
    });
  });

  describe("getRecordsVerifiedBy", () => {
    it("should return all records verified by a specific verifier", async () => {
      const staticData1 = JSON.stringify({
        name: "Name1",
        DOB: "DOB1",
        bloodType: "O+",
        gender: "Male",
      });
      const staticData2 = JSON.stringify({
        name: "Name2",
        DOB: "DOB2",
        bloodType: "A+",
        gender: "Female",
      });
      const staticData3 = JSON.stringify({
        name: "Name3",
        DOB: "DOB3",
        bloodType: "B+",
        gender: "Male",
      });

      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData1, "MedicalData1", verifier.address, 0);
      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData2, "MedicalData2", verifier.address, 0);
      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData3, "MedicalData3", verifier.address, 0);

      await biramiFiles.connect(verifier).verifyRecord(1);
      await biramiFiles.connect(verifier).verifyRecord(3);

      const recordsVerifiedBy = await biramiFiles.getRecordsVerifiedBy(
        verifier.address
      );
      expect(recordsVerifiedBy.length).to.equal(2);
      expect(recordsVerifiedBy[0].recordId).to.equal(1);
      expect(recordsVerifiedBy[1].recordId).to.equal(3);
    });
  });

  describe("getChainOfRecords", () => {
    it("should return the entire chain of records", async () => {
      const staticData1 = JSON.stringify({
        name: "Name1",
        DOB: "DOB1",
        bloodType: "O+",
        gender: "Male",
      });
      const staticData2 = JSON.stringify({
        name: "Name2",
        DOB: "DOB2",
        bloodType: "A+",
        gender: "Female",
      });

      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData1, "MedicalData1", verifier.address, 0);
      await biramiFiles.connect(verifier).verifyRecord(1);
      await biramiFiles
        .connect(creator)
        .proposeRecord(staticData2, "MedicalData2", verifier.address, 1);

      const chain = await biramiFiles.getChainOfRecords(2);
      expect(chain.length).to.equal(2);
      expect(chain[0].recordId).to.equal(2);
      expect(chain[1].recordId).to.equal(1);
    });
  });
});
