// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {RentalAgreementNFT} from "./RentalAgreementNFT.sol";
import {SignatureVerifier} from "./libs/SignatureVerifier.sol";

/// @title RentChannel
/// @notice ETH-based micropayment channel for rental agreements.
///         Tenant (payer) opens the channel and deposits ETH.
///         Landlord (payee) can withdraw rent via signed vouchers.
contract RentChannel is ReentrancyGuard {
    using SignatureVerifier for address;

    error InvalidParty();
    error AgreementEnded();
    error TooSoon();
    error Expired();
    error NonMonotonic();
    error BadSigner();
    error InsufficientBalance();

    struct Channel {
        address payer;        // tenant
        address payee;        // landlord
        uint256 deposit;      // total ETH deposited
        uint256 claimed;      // amount already paid to landlord
        uint256 nonce;        // last accepted voucher nonce
        uint64  timeoutAt;    // unix timestamp for payer timeout close
        bool    open;
    }

    RentalAgreementNFT public immutable nft;
    mapping(uint256 => Channel) public channels; // agreementId => channel

    event Opened(uint256 indexed agreementId, address payer, address payee, uint256 deposit, uint64 timeoutAt);
    event Deposited(uint256 indexed agreementId, uint256 amount);
    event Closed(uint256 indexed agreementId, uint256 paidToPayee);
    event TimeoutClosed(uint256 indexed agreementId, uint256 refunded);

    constructor(RentalAgreementNFT _nft) {
        nft = _nft;
    }

    /// @notice Open a new rent channel and deposit ETH.
    function open(uint256 agreementId, uint64 timeoutSeconds) external payable nonReentrant {
        RentalAgreementNFT.Terms memory info = nft.getTerms(agreementId);
        require(block.timestamp < info.end, "agreement ended");
        require(msg.sender == info.tenant, "only tenant");
        require(msg.value > 0, "no deposit");
        require(!channels[agreementId].open, "already open");

        Channel storage ch = channels[agreementId];
        ch.payer = info.tenant;
        ch.payee = info.landlord;
        ch.deposit = msg.value;
        ch.claimed = 0;
        ch.nonce = 0;
        ch.timeoutAt = uint64(block.timestamp) + timeoutSeconds;
        ch.open = true;

        emit Opened(agreementId, ch.payer, ch.payee, msg.value, ch.timeoutAt);
    }

    /// @notice Tenant deposits additional ETH into an existing open channel.
    function depositMore(uint256 agreementId) external payable nonReentrant {
        Channel storage ch = channels[agreementId];
        require(ch.open, "closed");
        require(msg.sender == ch.payer, "only tenant");
        require(msg.value > 0, "no value");
        ch.deposit += msg.value;
        emit Deposited(agreementId, msg.value);
    }

    /// @notice Landlord closes the channel using a signed voucher from the tenant.
    function close(SignatureVerifier.Voucher calldata v, bytes calldata sig) external nonReentrant {
        Channel storage ch = channels[v.agreementId];
        require(ch.open, "closed");

        RentalAgreementNFT.Terms memory info = nft.getTerms(v.agreementId);
        require(block.timestamp < info.end, "agreement ended");
        require(v.payee == info.landlord && v.payer == info.tenant, "invalid parties");
        require(msg.sender == info.landlord, "only landlord");
        require(v.nonce > ch.nonce, "old nonce");
        require(v.expiry > block.timestamp, "voucher expired");

        address signer = address(this).recoverSigner(v, sig);
        if (signer != info.tenant) revert BadSigner();

        require(v.amount <= ch.deposit, "voucher amount exceeds deposit");
        if (v.amount < ch.claimed) revert NonMonotonic();

        uint256 delta = v.amount - ch.claimed;
        if (delta > ch.deposit - ch.claimed) revert InsufficientBalance();

        ch.claimed = v.amount;
        ch.nonce = v.nonce;

        payable(info.landlord).transfer(delta);

        if (ch.claimed >= ch.deposit) {
            ch.open = false;
            emit Closed(v.agreementId, v.amount);
        }
    }

    /// @notice After timeout, tenant can close and reclaim unused deposit.
    function timeout(uint256 agreementId) external nonReentrant {
        Channel storage ch = channels[agreementId];
        require(ch.open, "closed");
        require(block.timestamp >= ch.timeoutAt, "timeout not reached");
        require(msg.sender == ch.payer, "only tenant");

        ch.open = false;
        uint256 refund = ch.deposit - ch.claimed;
        if (refund > 0) {
            payable(ch.payer).transfer(refund);
        }
        emit TimeoutClosed(agreementId, refund);
    }
}