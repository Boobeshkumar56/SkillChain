// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SkillToken
 * @dev ERC20 Token for SkillChain platform.
 *      - Capped supply: 10,000,000 SKL
 *      - Mintable only by platform owner
 *      - Transferable by users
 */
contract SkillToken is ERC20Capped, Ownable {

    uint8 private constant DECIMALS = 18;
    uint256 private constant MAX_SUPPLY = 10_000_000 * (10 ** uint256(DECIMALS));

    constructor(address initialOwner) ERC20("SkillToken", "SKL") ERC20Capped(MAX_SUPPLY) Ownable(initialOwner) {}

    /**
     * @dev Mint tokens to a user. Only the owner (platform) can call this.
     * @param to Address to mint tokens to
     * @param amount Number of tokens to mint (with 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= cap(), "SkillToken: Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Override decimals to 18
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}