pragma solidity ^0.5.16;

contract IPFSHash {

    //Store last hash from IPFS
    string  lastIpfsHash = 'NaN' ;

   function resetHash() public
   {
       lastIpfsHash = 'NaN';
   }
   function setHash(string memory _ipfsHash) public {
    lastIpfsHash = _ipfsHash;
  }

  function getHash() public view returns (string memory) {
    return lastIpfsHash;
  }


}


