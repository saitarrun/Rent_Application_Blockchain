// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract RentalAgreementNFT is ERC721, Ownable {
    using Strings for uint256;

    error NonTransferable();
    error NotAuthorized();
    error NotEnded();

    event AgreementMinted(uint256 indexed id, address indexed landlord, address indexed tenant);
    event AgreementEnded(uint256 indexed id);

    struct Terms {
        address landlord;
        address tenant;
        uint64  start;          // unix seconds
        uint64  end;            // unix seconds
        uint256 rentPerPeriod;  // wei per period
        bytes32 termsHash;      // off-chain terms reference
    }

    // tokenId => Terms
    mapping(uint256 => Terms) private _terms;

    uint256 private _nextId = 1;

    constructor() ERC721("RentalAgreement", "RENTNFT") Ownable(msg.sender) {}

    /// @notice mint a new agreement NFT to the tenant
    function mint(
        address landlord,
        address tenant,
        uint64 start,
        uint64 end,
        uint256 rentPerPeriod,
        bytes32 termsHash
    ) external onlyOwner returns (uint256 tokenId) {
        require(landlord != address(0) && tenant != address(0), "zero addr");
        require(start < end, "bad time");
        tokenId = _nextId++;
        _terms[tokenId] = Terms({
            landlord: landlord,
            tenant: tenant,
            start: start,
            end: end,
            rentPerPeriod: rentPerPeriod,
            termsHash: termsHash
        });
        _safeMint(tenant, tokenId);
        emit AgreementMinted(tokenId, landlord, tenant);
    }

    /// @notice read full terms as a struct (friendlier than the public mapping getter tuple)
    function getTerms(uint256 tokenId) external view returns (Terms memory) {
        _requireOwned(tokenId);
        return _terms[tokenId];
    }

    /// @notice landlord recorded for this agreement
    function landlordOf(uint256 tokenId) external view returns (address) {
        _requireOwned(tokenId);
        return _terms[tokenId].landlord;
    }

    /// @notice tenant recorded for this agreement
    function tenantOf(uint256 tokenId) external view returns (address) {
        _requireOwned(tokenId);
        return _terms[tokenId].tenant;
    }

    /// @notice burn after end; callable by owner (tenant) or landlord
    function burnAfterEnd(uint256 tokenId) external {
        _requireOwned(tokenId);
        Terms memory t = _terms[tokenId];
        require(block.timestamp >= t.end, "not ended");
        if (msg.sender != ownerOf(tokenId) && msg.sender != t.landlord) {
            revert NotAuthorized();
        }
        _burn(tokenId);
        delete _terms[tokenId];
        emit AgreementEnded(tokenId);
    }

    // ---------- Non-transferable enforcement (OZ v5) ----------

    /**
     * @dev In OZ v5, override `_update` to block transfers.
     *  - allow mint (from == address(0))
     *  - allow burn (to == address(0))
     *  - block regular transfers (both nonzero)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            // trying to transfer an existing token
            revert NonTransferable();
        }
        return super._update(to, tokenId, auth);
    }

    // Optional: token URI if you plan to render on-chain IDs only
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        // simple deterministic placeholder; replace with your metadata logic
        return string(abi.encodePacked("ipfs://REPLACE_ME/", tokenId.toString(), ".json"));
    }
}
