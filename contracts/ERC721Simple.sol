// SPDX-License-Identifier: MIT

/**
 * Author: Lawrence Onah <paplow01@gmail.com>
 * Github: https://github.com/kodjunkie
 */

pragma solidity >=0.8.13 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721Simple is ERC721, Ownable {
	using Strings for uint256;
	using Counters for Counters.Counter;

	Counters.Counter private _supply;

	string private baseURI;
	string private baseExt = ".json";

	// Total supply
	uint256 public constant MAX_SUPPLY = 41;

	// Public mint constants
	bool public saleActive = false;
	uint256 private constant MAX_PER_WALLET = 3; // 2/wallet (uses < to save gas)
	uint256 private constant MINT_PRICE = 0.3 ether;

	bool private _locked = false; // for re-entrancy guard

	// Initializes the contract by setting a `name` and a `symbol`
	constructor(string memory _initBaseURI) ERC721("ERC721Simple", "ERW") {
		_supply.increment();
		setBaseURI(_initBaseURI);
	}

	// Mint an NFT
	function mint(uint256 _quantity) external payable nonReentrant {
		require(saleActive, "Sale is closed at the moment.");

		address _to = msg.sender;
		require(_quantity > 0 && (balanceOf(_to) + _quantity) < MAX_PER_WALLET, "Invalid mint quantity.");
		require(msg.value >= (MINT_PRICE * _quantity), "Not enough ETH.");

		_mintLoop(_to, _quantity);
	}

	// Itrative mint handler
	function _mintLoop(address _to, uint256 _quantity) private {
		/**
		 * To save gas, since we know _quantity won't overflow
		 * Checks are performed in caller functions / methods
		 */
		unchecked {
			require((_quantity + _supply.current()) <= MAX_SUPPLY, "Max supply exceeded.");

			for (uint256 i = 0; i < _quantity; ++i) {
				_safeMint(_to, _supply.current());
				_supply.increment();
			}
		}
	}

	// Toggle sale state
	function toggleSaleState() public onlyOwner {
		saleActive = !saleActive;
	}

	// Get total supply
	function totalSupply() public view returns (uint256) {
		return _supply.current() - 1;
	}

	// Base URI
	function _baseURI() internal view virtual override returns (string memory) {
		return baseURI;
	}

	// Set base URI
	function setBaseURI(string memory _newBaseURI) public {
		baseURI = _newBaseURI;
	}

	// Get metadata URI
	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
		require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token.");

		string memory currentBaseURI = _baseURI();
		return
			bytes(currentBaseURI).length > 0
				? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExt))
				: "";
	}

	// Withdraw balance
	function withdraw() external onlyOwner {
		// Transfer the remaining balance to the owner
		// Do not remove this line, else you won't be able to withdraw the funds
		(bool sent, ) = payable(owner()).call{ value: address(this).balance }("");
		require(sent, "Failed to withdraw Ether.");
	}

	// Receive any funds sent to the contract
	receive() external payable {}

	// Reentrancy guard modifier
	modifier nonReentrant() {
		require(!_locked, "No re-entrant call.");
		_locked = true;
		_;
		_locked = false;
	}
}
