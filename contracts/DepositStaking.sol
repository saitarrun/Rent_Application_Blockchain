// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {RentalAgreementNFT} from "./RentalAgreementNFT.sol";

/// @title DepositStaking
/// @notice Simple security-deposit escrow that ties funds to a RentalAgreementNFT tokenId.
///         Tenant can fund at any time before end. After end, tenant can withdraw leftovers.
///         Landlord can claim portions during the term; both actions are guarded by roles.
contract DepositStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;              // ERC20 used as deposit currency
    RentalAgreementNFT public immutable nft;    // Agreement NFT registry

    // tokenId => current escrowed balance
    mapping(uint256 => uint256) public escrow;

    event Deposited(uint256 indexed tokenId, address indexed from, uint256 amount);
    event ClaimedByLandlord(uint256 indexed tokenId, address indexed landlord, uint256 amount, string reason);
    event WithdrawnByTenant(uint256 indexed tokenId, address indexed tenant, uint256 amount);

    constructor(IERC20 _asset, RentalAgreementNFT _nft) Ownable(msg.sender) {
        require(address(_asset) != address(0) && address(_nft) != address(0), "zero addr");
        asset = _asset;
        nft = _nft;
    }

    // ------------------------- views -------------------------

    /// @notice convenience view returning the full terms alongside escrowed balance
    function termsWithBalance(uint256 tokenId)
        external
        view
        returns (RentalAgreementNFT.Terms memory terms, uint256 balance)
    {
        terms = nft.getTerms(tokenId); // reverts if tokenId doesn't exist
        balance = escrow[tokenId];
    }

    // ------------------------- actions -------------------------

    /// @notice Tenant funds deposit for a given agreement.
    function deposit(uint256 tokenId, uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");

        // Will revert if tokenId doesn't exist
        RentalAgreementNFT.Terms memory info = nft.getTerms(tokenId);

        // optional time guard: allow funding any time before agreement end
        require(block.timestamp <= info.end, "agreement ended");

        // only the recorded tenant funds the deposit
        require(msg.sender == info.tenant, "only tenant");

        // pull funds and bump escrow
        asset.safeTransferFrom(msg.sender, address(this), amount);
        escrow[tokenId] += amount;

        emit Deposited(tokenId, msg.sender, amount);
    }

    /// @notice Landlord claims part of the deposit during the term.
    /// @dev Add your own policy checks (proofs, disputes) as needed.
    function landlordClaim(uint256 tokenId, uint256 amount, string calldata reason) external nonReentrant {
        require(amount > 0, "zero amount");

        RentalAgreementNFT.Terms memory info = nft.getTerms(tokenId);

        // only the recorded landlord
        require(msg.sender == info.landlord, "only landlord");

        // restrict claims to on or before end; relax if you prefer post-end claims
        require(block.timestamp <= info.end, "agreement ended");

        uint256 bal = escrow[tokenId];
        require(amount <= bal, "insufficient escrow");

        escrow[tokenId] = bal - amount;
        asset.safeTransfer(info.landlord, amount);

        emit ClaimedByLandlord(tokenId, info.landlord, amount, reason);
    }

    /// @notice After end, tenant withdraws any remaining deposit.
    function tenantWithdrawAfterEnd(uint256 tokenId) external nonReentrant {
        RentalAgreementNFT.Terms memory info = nft.getTerms(tokenId);

        // must be over
        require(block.timestamp >= info.end, "not ended");
        // only tenant can withdraw the remainder
        require(msg.sender == info.tenant, "only tenant");

        uint256 bal = escrow[tokenId];
        require(bal > 0, "zero balance");

        escrow[tokenId] = 0;
        asset.safeTransfer(info.tenant, bal);

        emit WithdrawnByTenant(tokenId, info.tenant, bal);
    }
}