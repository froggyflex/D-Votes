const Ecandidates = artifacts.require("Election");

module.exports = function(deployer) {
  deployer.deploy(Ecandidates);
};