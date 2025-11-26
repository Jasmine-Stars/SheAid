// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./SheAidRoles.sol";

contract NGORegistry {
    using SafeERC20 for IERC20;

    SheAidRoles public roles;
    IERC20 public stakeToken;

    struct NGOInfo {
        bool exists;
        bool approved;
        string name;
        string licenseId;      // 线下资质编号
        uint256 stakeAmount;   // 机构押金
    }

    mapping(address => NGOInfo) public ngos;
    uint256 public requiredNGOStake;

    event NGORegistered(
        address indexed ngoAddr,
        string name,
        string licenseId,
        uint256 stakeAmount,
        uint256 timestamp
    );

    event NGOApproved(address indexed ngoAddr, uint256 timestamp);

    constructor(SheAidRoles _roles, IERC20 _stakeToken) {
        roles = _roles;
        stakeToken = _stakeToken;
    }

    modifier onlyPlatformAdmin() {
        require(
            roles.hasRole(roles.PLATFORM_ADMIN_ROLE(), msg.sender),
            "Not platform admin:NGO"
        );
        _;
    }

    /// @notice 设置统一的 NGO 机构押金（MVP 统一数值）
    function setRequiredNGOStake(uint256 amount) external onlyPlatformAdmin {
        requiredNGOStake = amount;
    }

    /// @notice NGO 发起注册并缴纳押金
    function registerNGO(
        string calldata name,
        string calldata licenseId,
        uint256 stakeAmount
    ) external {
        require(!ngos[msg.sender].exists, "NGO already registered");
        require(stakeAmount >= requiredNGOStake, "stake too low");

        // 转入押金
        stakeToken.safeTransferFrom(msg.sender, address(this), stakeAmount);

        ngos[msg.sender] = NGOInfo({
            exists: true,
            approved: false,
            name: name,
            licenseId: licenseId,
            stakeAmount: stakeAmount
        });

        emit NGORegistered(msg.sender, name, licenseId, stakeAmount, block.timestamp);
    }

    /// @notice 平台管理员审核通过某个 NGO
    function approveNGO(address ngoAddr) external onlyPlatformAdmin {
        NGOInfo storage info = ngos[ngoAddr];
        require(info.exists, "NGO not registered");
        require(!info.approved, "NGO already approved");

        info.approved = true;

        // 给这个地址授予 NGO_ROLE
        roles.grantNGORoleByRegistry(ngoAddr);

        emit NGOApproved(ngoAddr, block.timestamp);
    }

    // （MVP 暂不实现 reject / 退还押金 / 紧急善款池等）
}
