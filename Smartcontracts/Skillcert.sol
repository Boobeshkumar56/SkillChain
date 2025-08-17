// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SkillCert
 * @dev ERC-721 NFT for SkillChain certificates
 *      - Single owner
 *      - Minting with metadata URI from frontend
 *      - Pausable
 *      - Fetch all user certificates
 */
contract SkillCert is ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from user to list of owned token IDs
    mapping(address => uint256[]) private _userTokens;

    event CertificateMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(address initialOwner) ERC721("SkillCert", "SCERT") Ownable(initialOwner) {}

    /**
     * @dev Mint a new certificate NFT
     * @param to Recipient address
     * @param tokenURI Metadata URI (JSON with name, theme, HTML link)
     */
    function mintCertificate(address to, string memory tokenURI) external onlyOwner whenNotPaused returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId); // Using _safeMint instead of _mint for better safety
        _setTokenURI(newTokenId, tokenURI);

        // Track user tokens
        _userTokens[to].push(newTokenId);

        emit CertificateMinted(to, newTokenId, tokenURI);
        return newTokenId;
    }

    /**
     * @dev Pause minting
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause minting
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get total certificates minted
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Get all token IDs owned by a user
     */
    function getUserCertificates(address user) external view returns (uint256[] memory) {
        return _userTokens[user];
    }
}