// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

library SignatureVerifier {
    // EIP-712 Voucher used by RentChannel.close
    struct Voucher {
        address payer;        // who funds the channel
        address payee;        // landlord
        uint256 agreementId;  // tokenId of RentalAgreementNFT
        uint256 amount;       // cumulative amount authorized
        uint256 nonce;        // monotonic
        uint256 expiry;       // unix seconds
    }

    // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
    bytes32 internal constant _EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    // keccak256("Voucher(address payer,address payee,uint256 agreementId,uint256 amount,uint256 nonce,uint256 expiry)")
    bytes32 internal constant _VOUCHER_TYPEHASH =
        keccak256("Voucher(address payer,address payee,uint256 agreementId,uint256 amount,uint256 nonce,uint256 expiry)");

    function domainSeparator(address verifyingContract) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                _EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("RentalSuite")),
                keccak256(bytes("1")),
                block.chainid,
                verifyingContract
            )
        );
    }

    function hashVoucher(Voucher memory v) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                _VOUCHER_TYPEHASH,
                v.payer,
                v.payee,
                v.agreementId,
                v.amount,
                v.nonce,
                v.expiry
            )
        );
    }

    function recoverSigner(address verifyingContract, Voucher memory v, bytes memory sig)
        internal
        view
        returns (address)
    {
        bytes32 digest = MessageHashUtils.toTypedDataHash(
            domainSeparator(verifyingContract),
            hashVoucher(v)
        );
        return ECDSA.recover(digest, sig);
    }
}