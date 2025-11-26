// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./SheAidRoles.sol";

contract PlatformAdmin {
    using SafeERC20 for IERC20;

    SheAidRoles public roles;
    IERC20 public platformToken;

    // 受助人黑名单
    mapping(address => bool) public blacklistedBeneficiaries;

    // 简单举报结构（MVP 只记录，不做审计分配）
    enum ReportTargetType { NGO, Project, Merchant, Beneficiary, Auditor }

    struct Report {
        uint256 id;
        address reporter;
        ReportTargetType targetType;
        address targetAddress;
        uint256 targetProjectId;
        string reason;
        uint256 createdAt;
    }

    uint256 public nextReportId;
    mapping(uint256 => Report) public reports;

    // 事件
    event BlacklistUpdated(
        address indexed account,
        string listType,
        bool blacklisted,
        uint256 timestamp
    );

    event PlatformDonationReceived(
        address indexed from,
        uint256 amount,
        uint256 timestamp
    );

    event PlatformFundsWithdrawn(
        address indexed to,
        uint256 amount,
        string reason,
        uint256 timestamp
    );

    event ReportSubmitted(
        uint256 indexed reportId,
        address indexed reporter,
        ReportTargetType indexed targetType,
        address targetAddress,
        uint256 targetProjectId,
        string reason,
        uint256 timestamp
    );

    constructor(SheAidRoles _roles, IERC20 _platformToken) {
        roles = _roles;
        platformToken = _platformToken;
    }

    modifier onlyPlatformAdmin() {
        require(
            roles.hasRole(roles.PLATFORM_ADMIN_ROLE(), msg.sender),
            "Not platform admin"
        );
        _;
    }

    // -------- 黑名单逻辑（MVP 只做受助人） --------

    function setBeneficiaryBlacklist(address user, bool blacklisted) external onlyPlatformAdmin {
        blacklistedBeneficiaries[user] = blacklisted;
        emit BlacklistUpdated(user, "beneficiary", blacklisted, block.timestamp);
    }

    function isBeneficiaryBlacklisted(address user) external view returns (bool) {
        return blacklistedBeneficiaries[user];
    }

    // -------- 平台运营资金：收款 + 提现 --------

    /// @notice 向平台运营资金池捐款
    function donateToPlatform(uint256 amount) external {
        require(amount > 0, "amount is zero");
        platformToken.safeTransferFrom(msg.sender, address(this), amount);
        emit PlatformDonationReceived(msg.sender, amount, block.timestamp);
    }

    /// @notice 平台管理员提取平台运营资金
    function withdrawPlatformFunds(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyPlatformAdmin {
        require(to != address(0), "to is zero");
        require(amount > 0, "amount is zero");
        platformToken.safeTransfer(to, amount);
        emit PlatformFundsWithdrawn(to, amount, reason, block.timestamp);
    }

    // -------- 举报：MVP 只把举报记账上链 --------

    function submitReport(
        ReportTargetType targetType,
        address targetAddress,
        uint256 targetProjectId,
        string calldata reason
    ) external returns (uint256 reportId) {
        require(targetAddress != address(0), "target is zero");
        // 所有举报编号不论类型依次叠加
        reportId = nextReportId;
        nextReportId += 1;

        reports[reportId] = Report({
            id: reportId,
            reporter: msg.sender,
            targetType: targetType,
            targetAddress: targetAddress,
            targetProjectId: targetProjectId,
            reason: reason,
            createdAt: block.timestamp
        });

        emit ReportSubmitted(
            reportId,
            msg.sender,
            targetType,
            targetAddress,
            targetProjectId,
            reason,
            block.timestamp
        );
    }
}
