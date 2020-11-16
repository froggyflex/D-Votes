const LoadVotingTable = artifacts.require("LoadVotingTable");

module.exports = function(deployer) {
  deployer.deploy(LoadVotingTable);
};