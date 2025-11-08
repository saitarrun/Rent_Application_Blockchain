// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {RENT} from "./RENT.sol";

/**
 * @title MVE
 * @notice Constant-product AMM for ETH/RENT with LP token accounting.
 */
contract MVE is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    event LiquidityAdded(address indexed provider, uint256 ethIn, uint256 rentIn, uint256 lpMinted);
    event LiquidityRemoved(address indexed provider, uint256 ethOut, uint256 rentOut, uint256 lpBurned);
    event Swapped(address indexed trader, bool ethToRent, uint256 amountIn, uint256 amountOut);

    uint256 private constant FEE_NUMERATOR = 997;
    uint256 private constant FEE_DENOMINATOR = 1000;

    RENT public immutable rentToken;
    uint256 public reserveETH;
    uint256 public reserveRent;

    constructor(RENT rentToken_, address initialOwner)
        ERC20("RENT Liquidity Provider", "RENT-LP")
        Ownable(initialOwner)
    {
        rentToken = rentToken_;
    }

    /**
     * @notice Provide liquidity to the pool.
     * @param rentAmount RENT provided alongside the ETH amount.
     * @return liquidity LP tokens minted.
     */
    function addLiquidity(uint256 rentAmount) external payable nonReentrant returns (uint256 liquidity) {
        require(msg.value > 0 && rentAmount > 0, "MVE:invalid-amounts");

        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(msg.value * rentAmount);
        } else {
            require(reserveETH > 0 && reserveRent > 0, "MVE:no-liquidity");
            require(msg.value * reserveRent == rentAmount * reserveETH, "MVE:ratio");
            liquidity = (msg.value * _totalSupply) / reserveETH;
        }
        require(liquidity > 0, "MVE:liquidity-zero");

        _mint(msg.sender, liquidity);
        IERC20(rentToken).safeTransferFrom(msg.sender, address(this), rentAmount);

        _updateReserves(address(this).balance, IERC20(rentToken).balanceOf(address(this)));

        emit LiquidityAdded(msg.sender, msg.value, rentAmount, liquidity);
    }

    /**
     * @notice Withdraw liquidity from the pool.
     * @param lpAmount Amount of LP tokens to burn.
     */
    function removeLiquidity(uint256 lpAmount) external nonReentrant returns (uint256 ethOut, uint256 rentOut) {
        require(lpAmount > 0, "MVE:lp");

        uint256 _totalSupply = totalSupply();
        ethOut = (reserveETH * lpAmount) / _totalSupply;
        rentOut = (reserveRent * lpAmount) / _totalSupply;
        require(ethOut > 0 && rentOut > 0, "MVE:insufficient-out");

        _burn(msg.sender, lpAmount);

        (bool ok, ) = msg.sender.call{value: ethOut}("");
        require(ok, "MVE:eth-transfer");
        IERC20(rentToken).safeTransfer(msg.sender, rentOut);

        _updateReserves(address(this).balance, IERC20(rentToken).balanceOf(address(this)));
        emit LiquidityRemoved(msg.sender, ethOut, rentOut, lpAmount);
    }

    /**
     * @notice Swap ETH for RENT.
     */
    function swapExactETHForRENT(uint256 minRentOut) external payable nonReentrant returns (uint256 amountOut) {
        require(msg.value > 0, "MVE:no-eth");
        require(reserveETH > 0 && reserveRent > 0, "MVE:no-liquidity");

        uint256 amountInWithFee = (msg.value * FEE_NUMERATOR) / FEE_DENOMINATOR;
        amountOut = (amountInWithFee * reserveRent) / (reserveETH + amountInWithFee);
        require(amountOut >= minRentOut, "MVE:slippage");

        IERC20(rentToken).safeTransfer(msg.sender, amountOut);
        _updateReserves(address(this).balance, IERC20(rentToken).balanceOf(address(this)));
        emit Swapped(msg.sender, true, msg.value, amountOut);
    }

    /**
     * @notice Swap RENT for ETH.
     * @param amountIn RENT supplied.
     * @param minEthOut Minimum ETH acceptable.
     */
    function swapExactRENTForETH(uint256 amountIn, uint256 minEthOut)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        require(amountIn > 0, "MVE:no-rent");
        require(reserveETH > 0 && reserveRent > 0, "MVE:no-liquidity");

        IERC20(rentToken).safeTransferFrom(msg.sender, address(this), amountIn);
        uint256 amountInWithFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        amountOut = (amountInWithFee * reserveETH) / (reserveRent + amountInWithFee);
        require(amountOut >= minEthOut, "MVE:slippage");
        require(address(this).balance >= amountOut, "MVE:eth-liquidity");

        (bool ok, ) = msg.sender.call{value: amountOut}("");
        require(ok, "MVE:eth-transfer");

        _updateReserves(address(this).balance, IERC20(rentToken).balanceOf(address(this)));
        emit Swapped(msg.sender, false, amountIn, amountOut);
    }

    function _updateReserves(uint256 ethBalance, uint256 rentBalance) private {
        reserveETH = ethBalance;
        reserveRent = rentBalance;
    }

    receive() external payable {}
}
