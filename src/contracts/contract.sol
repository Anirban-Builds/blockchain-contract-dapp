// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ContractAgreement{
    struct Agreement{
        address userA;
        address userB;
        string ipfsHash;
        bool signedByA;
        bool signedByB;
        uint256 createdAt;
        uint256 signedAt;
    }

    mapping(uint256 => Agreement) public agreements;
    uint256 public cnt;

    event AgreementCreated(uint256 indexed id, address userA, address userB, string ipfsHash);

    function createAgreement(address userA, string calldata ipfsHash) external returns (uint256) {
    uint256 id = cnt++;
    agreements[id] = Agreement({
        userA: userA,
        userB: msg.sender,
        ipfsHash: ipfsHash,
        signedByA: true,
        signedByB: true,
        createdAt: block.timestamp,
        signedAt: block.timestamp
    });
    emit AgreementCreated(id, userA, msg.sender, ipfsHash);
    return id;
}

    function _is_Completed(uint256 id) internal view returns (bool) {
        return bytes(agreements[id].ipfsHash).length > 0;
    }

    function getAgreement(uint256 id) external view returns (Agreement memory){
        return agreements[id];
    }

}



