const lasthash = artifacts.require("IPFSHash");

module.exports = function(deployer) {
  deployer.deploy(lasthash);
};