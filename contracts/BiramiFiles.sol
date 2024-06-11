// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BiramiFiles {
    uint public recordId;
    mapping(uint => Record) public records;

    struct Record {
        uint recordId;
        uint timestamp;
        string name;
        string DOB; // Date of Birth
        string bloodType;
        string gender;
        string medicalData;
        address creator;
        address verifier;
        bool isVerified;
        bool isDeleted;
    }

    event RecordProposed(
        uint recordId,
        uint timestamp,
        string name,
        string DOB,
        string bloodType,
        string gender,
        string medicalData,
        address creator,
        address verifier
    );

    event RecordVerified(uint recordId, address verifier);

    event RecordDeleted(uint recordId, address deletedBy);

    constructor() {}

    function proposeRecord(
        string memory _name,
        string memory _DOB,
        string memory _bloodType,
        string memory _gender,
        string memory _medicalData,
        address _verifier
    ) public {
        recordId++;
        records[recordId] = Record(
            recordId,
            block.timestamp,
            _name,
            _DOB,
            _bloodType,
            _gender,
            _medicalData,
            msg.sender,
            _verifier,
            false,
            false
        );
        emit RecordProposed(
            recordId,
            block.timestamp,
            _name,
            _DOB,
            _bloodType,
            _gender,
            _medicalData,
            msg.sender,
            _verifier
        );
    }

    function verifyRecord(uint _recordId) public {
        Record storage record = records[_recordId];
        require(
            msg.sender == record.verifier,
            "Only designated verifier can verify"
        );
        require(!record.isVerified, "Record already verified");

        record.isVerified = true;

        emit RecordVerified(_recordId, msg.sender);
    }

    function deleteRecord(uint _recordId) public {
        Record storage record = records[_recordId];
        require(
            msg.sender == record.creator || msg.sender == record.verifier,
            "Not authorized to delete"
        );
        require(!record.isDeleted, "Record already deleted");

        record.isDeleted = true;

        emit RecordDeleted(_recordId, msg.sender);
    }

    function getRecord(uint _recordId) public view returns (Record memory) {
        return records[_recordId];
    }
}
