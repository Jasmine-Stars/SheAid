// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./SheAidRoles.sol";

contract MerchantRegistry {
    using SafeERC20 for IERC20;

    SheAidRoles public roles;
    IERC20 public stakeToken;
    // 没有注册，已申请待审核，审核通过，暂停（可申诉），永久封禁
    enum MerchantStatus { None, Pending, Active, Frozen, Banned }

    struct MerchantInfo {
        MerchantStatus status;
        uint256 stakeAmount;
        string name;
        string metadata; // 可选：商户介绍或资质编号
    }

    mapping(address => MerchantInfo) public merchants;
    uint256 public minMerchantStake;

    event MerchantRegistered(
        address indexed merchant,
        string name,
        MerchantStatus indexed newStatus,
        string metadata,
        uint256 stakeAmount,
        uint256 timestamp
    );

    event MerchantStatusChanged(
        address indexed merchant,
        MerchantStatus newStatus,
        uint256 timestamp
    );

    constructor(SheAidRoles _roles, IERC20 _stakeToken) {
        roles = _roles;
        stakeToken = _stakeToken;
    }

    modifier onlyPlatformAdmin() {
        require(
            roles.hasRole(roles.PLATFORM_ADMIN_ROLE(), msg.sender),
            "Not platform admin:MerchantRegegistry"
        );
        _;
    }

    /// @notice 设置最低商户押金
    function setMinMerchantStake(uint256 amount) external onlyPlatformAdmin {
        minMerchantStake = amount;
    }
    
    /// @notice Marketplace 要调用的是否是激活的商户 Active
    function isActiveMerchant(address merchant) external view returns (bool) {
        MerchantInfo storage info = merchants[merchant];
        return info.status == MerchantStatus.Active;
    }

    /// @notice 商户发起注册并缴纳押金
    function registerMerchant(
        string calldata name,
        string calldata metadata,
        uint256 stakeAmount
    ) external {
        MerchantInfo storage info = merchants[msg.sender];
        require(info.status == MerchantStatus.None, "Already registered");
        require(stakeAmount >= minMerchantStake, "stake too low");

        stakeToken.safeTransferFrom(msg.sender, address(this), stakeAmount);

        merchants[msg.sender] = MerchantInfo({
            status: MerchantStatus.Pending,
            stakeAmount: stakeAmount,
            name: name,
            metadata: metadata
        });

        emit MerchantRegistered(msg.sender, name, MerchantStatus.Pending, metadata, stakeAmount, block.timestamp);

        // 注意：这里不直接授予 MERCHANT_ROLE;已改版，同NGO注册一样需要在商户注册处同意
        // 平台管理员可以在前端看到此事件后，手动调用 SheAidRoles.grantMerchantRole
        // 这样审核自由度更高？暂时的逻辑必须通过此合约approve，否则其状态得通过调整商户状态解决
    }

    /// @notice 平台管理员审核通过商户
    function approveMerchant(address merchant) external onlyPlatformAdmin {
        MerchantInfo storage info = merchants[merchant];
        require(info.status == MerchantStatus.Pending, "Not pending");

        info.status = MerchantStatus.Active;

        // 如果你有角色系统：授予 MERCHANT_ROLE
        //roles.grantMerchantRole(merchant);
        roles.grantMerchantRoleByRegistry(merchant);

        emit MerchantStatusChanged(merchant, MerchantStatus.Active, block.timestamp);
    }



    /// @notice 平台管理员可以调整商户状态（比如冻结/封禁）
    function setMerchantStatus(
        address merchant,
        MerchantStatus newStatus
    ) external onlyPlatformAdmin {
        MerchantInfo storage info = merchants[merchant];
        require(info.status != MerchantStatus.None, "Merchant not exists");

        info.status = newStatus;
        emit MerchantStatusChanged(merchant, newStatus, block.timestamp);
    }

    // （MVP 暂不实现罚没押金 / 退还押金等复杂逻辑）
}
