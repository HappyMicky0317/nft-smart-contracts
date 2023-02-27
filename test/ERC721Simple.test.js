// ERC721Simple contract tests
const ERC721Simple = artifacts.require("ERC721Simple");
const expect = require("../setup-tests").expect;
const BN = web3.utils.BN;

contract("ERC721Simple", (accounts) => {
	let instance;
	const gas = 300000;

	// Test accounts
	const [deployer, publicAcc, otherAcc] = accounts;

	before(async () => {
		instance = await ERC721Simple.deployed();
	});

	it("can toggle sale state", async () => {
		// Ensure sales is closed (default)
		expect(instance.saleActive()).to.eventually.be.false;
		// Toggle sales
		await instance.toggleSaleState();
		// Verification
		expect(instance.saleActive()).to.eventually.be.true;
	});

	it("should  accept full payment", () => {
		expect(
			instance.mint(1, { from: otherAcc, value: web3.utils.toWei("0.2", "ether"), gas })
		).to.eventually.be.rejectedWith("Not enough ETH.");
	});

	it("throws when max allowed per wallet is exceeded", () => {
		expect(
			instance.mint(3, { from: publicAcc, value: web3.utils.toWei("0.9", "ether"), gas })
		).to.eventually.be.rejectedWith("Invalid mint quantity.");
	});

	it("ensures mint quantity is properly validated", () => {
		// Validate for null (0) quantity
		expect(
			instance.mint(0, { from: otherAcc, value: web3.utils.toWei("0.3", "ether"), gas })
		).to.eventually.be.rejectedWith("Invalid mint quantity.");
	});

	it("should be able to mint tokens", async () => {
		const quantity = 2;
		await instance.mint(quantity, {
			from: otherAcc,
			value: web3.utils.toWei("0.6", "ether"),
			gas,
		});
		expect(instance.balanceOf(otherAcc)).to.eventually.be.a.bignumber.equal(new BN(quantity));
	});

	it("should be able to perform withdrawal of funds from the contract", async () => {
		let balance = await web3.eth.getBalance(deployer);
		await instance.withdraw();

		expect(web3.eth.getBalance(deployer)).to.eventually.be.a.bignumber.greaterThan(new BN(balance));
	});

	after(() => {
		instance = undefined;
	});
});
