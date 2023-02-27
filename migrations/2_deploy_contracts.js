const ERC721Whitelist = artifacts.require("ERC721Whitelist");
const ERC721Simple = artifacts.require("ERC721Simple");

/**
 * NOTE: If you're deploy directly from this project
 * Ensure to comment out redundant deployments
 * @param  {} deployer
 */
module.exports = function (deployer) {
	// An ipfs:// or http(s):// URL to assets
	const baseUrl = "http://assets.example.com/";

	// To deploy the whitelist supported contract
	// Since it has reveal feature, you need to provide
	// the URI to the "hidden.json" file as the third argument
	deployer.deploy(ERC721Whitelist, baseUrl, `${baseUrl}hidden.json`);

	// To deploy the simple contract
	deployer.deploy(ERC721Simple, baseUrl);
};
