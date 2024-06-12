// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract BiramiFiles {
    uint public recordId;
    mapping(uint => Record) public records;

    struct Record {
        uint recordId;
        uint previousRecordId;
        uint timestamp;
        string staticData; // JSON string containing name, DOB, BloodType, gender
        string medicalData;
        address creator;
        address verifier;
        bool isVerified;
        bool isDeleted;
    }

    event RecordProposed(
        uint recordId,
        uint timestamp,
        string staticData,
        string medicalData,
        address creator,
        address verifier,
        uint previousRecordId // New field in the event
    );

    event RecordVerified(uint recordId, address verifier);

    event RecordDeleted(uint recordId, address deletedBy);

    constructor() {}

    function proposeRecord(
        string memory _staticData, // JSON string
        string memory _medicalData,
        address _verifier,
        uint _previousRecordId // New parameter for previous record ID
    ) public {
        // Ensure the previousRecordId is valid (i.e., 0 or an existing record ID)
        require(
            _previousRecordId == 0 ||
                records[_previousRecordId].recordId == _previousRecordId,
            "Invalid previousRecordId"
        );

        // Ensure the verifier of the new record is the same as the verifier of the previous record
        if (_previousRecordId != 0) {
            require(
                records[_previousRecordId].isVerified,
                "Previous record must be verified"
            );
            require(
                records[_previousRecordId].verifier == _verifier,
                "Verifier must be the same as the previous record"
            );
        }

        recordId++;
        records[recordId] = Record(
            recordId,
            _previousRecordId, // Assign the previousRecordId
            block.timestamp,
            _staticData, // Store static data as JSON string
            _medicalData,
            msg.sender,
            _verifier,
            false,
            false
        );
        emit RecordProposed(
            recordId,
            block.timestamp,
            _staticData,
            _medicalData,
            msg.sender,
            _verifier,
            _previousRecordId // Include the new field
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

    // function to retrive all verified records
    // function to retrive all verified records
    function getVerifiedRecords() public view returns (Record[] memory) {
        uint verifiedRecordCount = 0;
        // First, count the number of verified records
        for (uint i = 1; i <= recordId; i++) {
            if (records[i].isVerified && !records[i].isDeleted) {
                verifiedRecordCount++;
            }
        }

        Record[] memory verifiedRecords = new Record[](verifiedRecordCount);
        uint j = 0;
        for (uint i = 1; i <= recordId; i++) {
            if (records[i].isVerified && !records[i].isDeleted) {
                verifiedRecords[j] = records[i];
                j++;
            }
        }
        return verifiedRecords;
    }

    // Function to retrieve all the records to be verified by a particular verifier
    function getRecordsToVerify(
        address _verifier
    ) public view returns (Record[] memory) {
        uint count = 0;
        for (uint i = 1; i <= recordId; i++) {
            if (records[i].verifier == _verifier && !records[i].isVerified) {
                count++;
            }
        }
        Record[] memory recordsToVerify = new Record[](count);
        uint index = 0;
        for (uint i = 1; i <= recordId; i++) {
            if (records[i].verifier == _verifier && !records[i].isVerified) {
                recordsToVerify[index] = records[i];
                index++;
            }
        }
        return recordsToVerify;
    }

    // Function to retrieve all the records created by a particular creator
    function getRecordsByCreator(
        address _creator
    ) public view returns (Record[] memory) {
        uint count = 0;
        for (uint i = 1; i <= recordId; i++) {
            if (records[i].creator == _creator) {
                count++;
            }
        }
        Record[] memory recordsByCreator = new Record[](count);
        uint index = 0;
        for (uint i = 1; i <= recordId; i++) {
            if (records[i].creator == _creator) {
                recordsByCreator[index] = records[i];
                index++;
            }
        }
        return recordsByCreator;
    }

    // Function to retrieve all the records that are verified by a particular verifier
    function getRecordsVerifiedBy(
        address _verifier
    ) public view returns (Record[] memory) {
        uint count = 0;
        for (uint i = 1; i <= recordId; i++) {
            if (records[i].verifier == _verifier && records[i].isVerified) {
                count++;
            }
        }
        Record[] memory recordsVerifiedBy = new Record[](count);
        uint index = 0;
        for (uint i = 1; i <= recordId; i++) {
            if (records[i].verifier == _verifier && records[i].isVerified) {
                recordsVerifiedBy[index] = records[i];
                index++;
            }
        }
        return recordsVerifiedBy;
    }

    function getChainOfRecords(
        uint _recordId
    ) public view returns (Record[] memory) {
        uint count = 0;
        uint currentId = _recordId;

        // Count the number of records in the chain
        while (currentId != 0) {
            count++;
            currentId = records[currentId].previousRecordId;
        }

        Record[] memory chain = new Record[](count);
        currentId = _recordId;

        // Populate the chain array with records
        for (uint i = 0; i < count; i++) {
            chain[i] = records[currentId];
            currentId = records[currentId].previousRecordId;
        }

        return chain;
    }
}
