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
    beforeEach(async () => {
      const recordName = "John Doe";
      const recordDOB = "1990-01-01";
      const recordBloodType = "O+";
      const recordGender = "Male";
      const recordMedicalData = "No known medical conditions";

      transactionResponse = await biramiFiles.proposeRecord(
        recordName,
        recordDOB,
        recordBloodType,
        recordGender,
        recordMedicalData,
        verifier.address
      );

      const recordId = await biramiFiles.recordId();
      const record = await biramiFiles.getRecord(recordId);

      expect(record.recordId).to.equal(recordId);
      expect(record.name).to.equal(recordName);
      expect(record.DOB).to.equal(recordDOB);
      expect(record.bloodType).to.equal(recordBloodType);
      expect(record.gender).to.equal(recordGender);
      expect(record.medicalData).to.equal(recordMedicalData);
      expect(record.creator).to.equal(creator.address);
      expect(record.verifier).to.equal(verifier.address);
      expect(record.isVerified).to.equal(false);
      expect(record.isDeleted).to.equal(false);
      transactionReceipt = await transactionResponse.wait();
    });

    it("should emit a RecordProposed event", async () => {
      const recordName = "John Doe";
      const recordDOB = "1990-01-01";
      const recordBloodType = "O+";
      const recordGender = "Male";
      const recordMedicalData = "No known medical conditions";

      const event = await transactionReceipt.events[0];
      expect(event.event).to.equal("RecordProposed");
      expect(event).to.not.be.undefined;
      expect(event.args.name).to.equal(recordName);
      expect(event.args.DOB).to.equal(recordDOB);
      expect(event.args.bloodType).to.equal(recordBloodType);
      expect(event.args.gender).to.equal(recordGender);
      expect(event.args.medicalData).to.equal(recordMedicalData);
      expect(event.args.creator).to.equal(creator.address);
      expect(event.args.verifier).to.equal(verifier.address);
    });
  });

  describe("Verify Record", () => {
    let recordId;

    beforeEach(async () => {
      const recordName = "Jane Doe";
      const recordDOB = "1985-05-15";
      const recordBloodType = "AB-";
      const recordGender = "Female";
      const recordMedicalData = "Hypertension";

      await biramiFiles.proposeRecord(
        recordName,
        recordDOB,
        recordBloodType,
        recordGender,
        recordMedicalData,
        verifier.address
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
      const recordName = "Jack Smith";
      const recordDOB = "1975-12-30";
      const recordBloodType = "A+";
      const recordGender = "Male";
      const recordMedicalData = "Diabetes";

      await biramiFiles.proposeRecord(
        recordName,
        recordDOB,
        recordBloodType,
        recordGender,
        recordMedicalData,
        verifier.address
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
      // await expect(biramiFiles.connect(creator).deleteRecord(recordId)).to.not
      //   .be.reverted;
      // await expect(biramiFiles.connect(verifier).deleteRecord(recordId)).to.not
      //   .be.reverted;
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
});
