// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20, ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RENT Token
 * @notice Utility ERC20 used across the rental-suite protocol.
 */
contract RENT is ERC20Burnable, Ownable {
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event MinterUpdated(address indexed account, bool allowed);

    mapping(address => bool) public minters;

    constructor(address initialOwner) ERC20("RENT Token", "RENT") Ownable(initialOwner) {}

    /**
     * @notice Update permission for a minter.
     * @param account Address to update.
     * @param allowed Whether the address can mint.
     */
    function setMinter(address account, bool allowed) external onlyOwner {
        minters[account] = allowed;
        emit MinterUpdated(account, allowed);
    }

    /**
     * @notice Mint new RENT tokens.
     * @param to Recipient of the minted tokens.
     * @param amount Amount to mint.
     */
    function mint(address to, uint256 amount) external onlyAuthorized {
        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @notice Burn tokens from an account with allowance.
     * @param account Owner of the tokens being burned.
     * @param amount Amount to burn.
     */
    function burnFrom(address account, uint256 amount) public override onlyAuthorized {
        super.burnFrom(account, amount);
        emit Burn(account, amount);
    }

    /**
     * @notice Burn caller-owned tokens.
     * @param amount Amount to burn.
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit Burn(_msgSender(), amount);
    }

    modifier onlyAuthorized() {
        require(minters[_msgSender()] || _msgSender() == owner(), "RENT:not-minter");
        _;
    }
}
