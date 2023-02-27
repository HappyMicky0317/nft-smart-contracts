// ERC721Whitelist contract tests
const ERC721Whitelist = artifacts.require("ERC721Whitelist");
const expect = require("../setup-tests").expect;
const BN = web3.utils.BN;

contract("ERC721Whitelist", (accounts) => {
	let instance;
	const gas = 300000;

	// Test accounts
	const [deployer, whitelistAcc, publicAcc, otherAcc] = accounts;

	before(async () => {
		instance = await ERC721Whitelist.deployed();
	});

	it("can add to whitelist", async () => {
		// Make sure the whitelist account is not yet whitelisted
		expect(instance.isWhitelisted(whitelistAcc)).to.eventually.be.false;
		// Add whitelist account to whitelist :)
		await instance.toggleWhitelist(whitelistAcc);
		// Verify that the account is now whitelisted
		expect(instance.isWhitelisted(whitelistAcc)).to.eventually.be.true;
	});

	it("can toggle sale state", async () => {
		// Ensure the whitelist and public sale is closed (default)
		expect(instance.wlMintActive()).to.eventually.be.false;
		expect(instance.pubMintActive()).to.eventually.be.false;

		// Toggle sales
		await instance.toggleWlMintActive(); // Whitelist sale
		await instance.togglePubMintActive(); // Public sale

		// Verification
		expect(instance.wlMintActive()).to.eventually.be.true;
		expect(instance.pubMintActive()).to.eventually.be.true;
	});

	it("should be able to perform airdrop mint", async () => {
		const quantity = 1;
		await instance.airDropMint(otherAcc, quantity, { gas });
		expect(instance.balanceOf(otherAcc)).to.eventually.be.a.bignumber.equal(new BN(quantity));
	});

	it("ensures only whitelisted accounts can perform whitelist mint", () => {
		expect(
			instance.whitelistMint(1, { from: publicAcc, value: web3.utils.toWei("0.05", "ether"), gas })
		).to.eventually.be.rejectedWith("You're not whitelisted.");
	});

	it("should be able to mint tokens", async () => {
		const quantity = 1;
		// Whitelist
		await instance.whitelistMint(quantity, {
			from: whitelistAcc,
			value: web3.utils.toWei("0.05", "ether"),
			gas,
		});
		expect(instance.balanceOf(whitelistAcc)).to.eventually.be.a.bignumber.equal(new BN(quantity));

		// Public mint
		await instance.publicMint(quantity, {
			from: publicAcc,
			value: web3.utils.toWei("0.065", "ether"),
			gas,
		});
		expect(instance.balanceOf(publicAcc)).to.eventually.be.a.bignumber.equal(new BN(quantity));
	});

	it("throws when max allowed per wallet is exceeded", () => {
		// Since the whitelisted account already minted 1 token
		// lets try to mint 2 instead to see if it passes
		expect(
			instance.whitelistMint(2, { from: whitelistAcc, value: web3.utils.toWei("0.05", "ether"), gas })
		).to.eventually.be.rejectedWith("Invalid mint quantity.");

		// Now for public mint
		// We know the public mint account still has 2 mint left
		// But let's try to mint 3 instead
		expect(
			instance.publicMint(3, { from: publicAcc, value: web3.utils.toWei("0.13", "ether"), gas })
		).to.eventually.be.rejectedWith("Invalid mint quantity.");
	});

	it("ensures mint quantity is properly validated", () => {
		// Let's try to mint a zero (0) quantity
		// Public
		expect(
			instance.publicMint(0, { from: otherAcc, value: web3.utils.toWei("0.065", "ether"), gas })
		).to.eventually.be.rejectedWith("Invalid mint quantity.");

		// Whitelist
		expect(
			instance.whitelistMint(0, { from: whitelistAcc, value: web3.utils.toWei("0.05", "ether"), gas })
		).to.eventually.be.rejectedWith("Invalid mint quantity.");
	});

	it("should only accept full payment", () => {
		const quantity = 1;
		// Whitelist sale
		expect(
			instance.whitelistMint(quantity, { from: whitelistAcc, value: web3.utils.toWei("0.04", "ether"), gas })
		).to.eventually.be.rejectedWith("Not enough ETH.");

		// Public sale
		expect(
			instance.publicMint(quantity, { from: publicAcc, value: web3.utils.toWei("0.06", "ether"), gas })
		).to.eventually.be.rejectedWith("Not enough ETH.");
	});

	it("ensures distribution is not more than the maximum supply", async () => {
		// Aside initial mint for testing purpose
		// let's try to mint 1 more than the maximum supply to make sure it passes
		const quantity = (await instance.MAX_SUPPLY()) + 1;
		expect(instance.airDropMint(otherAcc, quantity, { gas })).to.eventually.be.rejectedWith("Max supply exceeded.");
	});

	it("should be able to perform withdrawal of funds from the contract", async () => {
		let initBalance = await web3.eth.getBalance(deployer);
		await instance.withdraw();

		expect(web3.eth.getBalance(deployer)).to.eventually.be.a.bignumber.greaterThan(new BN(initBalance));
	});

	after(() => {
		instance = undefined;
	});
});
