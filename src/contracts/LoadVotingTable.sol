pragma solidity ^0.5.16;

contract LoadVotingTable{

    string elementHash;


    //send the part of the page that will be decentralized
    function setHash(string memory _elementHash) public
    {
        elementHash = _elementHash;
    }

    //read the part of the page that will be decentralized
    function getTable() public view returns (string memory)
    {
        return elementHash;
    }

}
