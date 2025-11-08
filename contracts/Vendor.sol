// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {RENT} from "./RENT.sol";

/**
 * @title Vendor
 * @notice Simple buy/sell desk between ETH and RENT token.
 */
contract Vendor is Ownable, ReentrancyGuard {
    uint256 private constant PRECISION = 1e18;

    event PricesUpdated(uint256 buyPrice, uint256 sellPrice);
    event Purchased(address indexed buyer, uint256 ethIn, uint256 rentOut);
    event Sold(address indexed seller, uint256 rentIn, uint256 ethOut);

    RENT public immutable rentToken;
    uint256 public buyPrice; // RENT per 1 ETH, scaled by 1e18
    uint256 public sellPrice; // ETH per 1 RENT, scaled by 1e18

    constructor(RENT rentToken_, address initialOwner) Ownable(initialOwner) {
        rentToken = rentToken_;
    }

    /**
     * @notice Update buy and sell prices.
     * @param buyPrice_ RENT per ETH (scaled 1e18).
     * @param sellPrice_ ETH per RENT (scaled 1e18).
     */
    function setPrices(uint256 buyPrice_, uint256 sellPrice_) external onlyOwner {
        require(buyPrice_ > 0 && sellPrice_ > 0, "Vendor:invalid-prices");
        buyPrice = buyPrice_;
        sellPrice = sellPrice_;
        emit PricesUpdated(buyPrice_, sellPrice_);
    }

    /**
     * @notice Purchase RENT using ETH.
     */
    function buy() external payable nonReentrant {
        require(msg.value > 0, "Vendor:no-eth");
        require(buyPrice > 0, "Vendor:no-price");

        uint256 rentOut = (msg.value * buyPrice) / PRECISION;
        require(rentOut > 0, "Vendor:rounding");

        rentToken.mint(msg.sender, rentOut);
        emit Purchased(msg.sender, msg.value, rentOut);
    }

    /**
     * @notice Sell RENT for ETH.
     * @param amount Amount of RENT to sell.
     */
    function sell(uint256 amount) external nonReentrant {
        require(amount > 0, "Vendor:no-amount");
        require(sellPrice > 0, "Vendor:no-price");

        uint256 ethOut = (amount * sellPrice) / PRECISION;
        require(address(this).balance >= ethOut, "Vendor:insufficient-eth");

        rentToken.burnFrom(msg.sender, amount);
        (bool ok, ) = msg.sender.call{value: ethOut}("");
        require(ok, "Vendor:eth-transfer");

        emit Sold(msg.sender, amount, ethOut);
    }

    /**
     * @notice Allow owner to withdraw excess ETH.
     * @param to Recipient.
     * @param amount Amount to withdraw.
     */
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "Vendor:withdraw");
    }

    receive() external payable {}
}
