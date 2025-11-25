// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./SheAidRoles.sol";
import "./BeneficiaryModule.sol";

contract ProjectVaultManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    SheAidRoles public roles;
    IERC20 public settlementToken;
    BeneficiaryModule public beneficiaryModule;

    enum ProjectStatus { None, Active, Closed }

    struct Project {
        uint256 id;
        address ngoAddr;
        address manager;
        uint256 budget;
        uint256 deposit;
        uint256 donatedAmount;
        uint256 remainingFunds;
        ProjectStatus status;
        string title;
        string description;
        string categoryTag;
        uint256 createdAt;
        uint256 closedAt;
    }

    uint256 public nextProjectId;
    mapping(uint256 => Project) public projects;

    // 事件
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed ngoAddr,
        address indexed manager,
        uint256 budget,
        uint256 deposit,
        string title,
        string categoryTag,
        uint256 timestamp
    );

    event ProjectDonationReceived(
        uint256 indexed projectId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );

    event ProjectFundsAllocatedToBeneficiary(
        uint256 indexed projectId,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );

    event ProjectClosed(
        uint256 indexed projectId,
        uint256 remainingFundsReturned,
        uint256 depositReturned,
        uint256 timestamp
    );

    constructor(
        SheAidRoles _roles,
        IERC20 _settlementToken,
        BeneficiaryModule _beneficiaryModule
    ) {
        roles = _roles;
        settlementToken = _settlementToken;
        beneficiaryModule = _beneficiaryModule;
    }

    modifier onlyNGO() {
        require(
            roles.hasRole(roles.NGO_ROLE(), msg.sender),
            "Not NGO"
        );
        _;
    }

    // ========= 创建项目 =========

    function createProject(
        uint256 budget,
        string calldata title,
        string calldata description,
        string calldata categoryTag,
        uint256 deposit
    ) external nonReentrant onlyNGO returns (uint256 projectId) {
        require(budget > 0, "budget zero");
        require(deposit > 0, "deposit zero");

        // 这里简单用 120% 校验；你也可以改成基于 bps 的更精确版本
        // 条件：deposit >= 1.2 * budget
        uint256 minDeposit = (budget * 120) / 100;
        require(deposit >= minDeposit, "deposit too low");

        // 转入项目押金
        settlementToken.safeTransferFrom(msg.sender, address(this), deposit);

        projectId = nextProjectId;
        nextProjectId += 1;

        Project storage p = projects[projectId];
        p.id = projectId;
        p.ngoAddr = msg.sender;
        p.manager = msg.sender;
        p.budget = budget;
        p.deposit = deposit;
        p.donatedAmount = 0;
        p.remainingFunds = 0;
        p.status = ProjectStatus.Active;
        p.title = title;
        p.description = description;
        p.categoryTag = categoryTag;
        p.createdAt = block.timestamp;
        p.closedAt = 0;

        emit ProjectCreated(
            projectId,
            msg.sender,
            msg.sender,
            budget,
            deposit,
            title,
            categoryTag,
            block.timestamp
        );
    }

    // ========= 捐赠进入项目资金池 =========

    function donateToProject(uint256 projectId, uint256 amount)
        external
        nonReentrant
    {
        Project storage p = projects[projectId];
        require(p.status == ProjectStatus.Active, "project not active");
        require(amount > 0, "amount zero");

        settlementToken.safeTransferFrom(msg.sender, address(this), amount);

        p.donatedAmount += amount;
        p.remainingFunds += amount;

        emit ProjectDonationReceived(
            projectId,
            msg.sender,
            amount,
            block.timestamp
        );
    }

    // ========= 项目资金分配给受助人 =========

    function allocateToBeneficiary(
        uint256 projectId,
        address beneficiary,
        uint256 amount
    ) external nonReentrant {
        Project storage p = projects[projectId];
        require(p.status == ProjectStatus.Active, "project not active");
        require(msg.sender == p.ngoAddr, "not project NGO");
        require(beneficiary != address(0), "beneficiary zero");
        require(amount > 0, "amount zero");
        require(p.remainingFunds >= amount, "insufficient project funds");

        p.remainingFunds -= amount;

        beneficiaryModule.grantCharityToken(beneficiary, amount, projectId);

        emit ProjectFundsAllocatedToBeneficiary(
            projectId,
            beneficiary,
            amount,
            block.timestamp
        );
    }

    // ========= 项目结束（MVP：剩余资金 + 押金全退给 NGO） =========

    function closeProject(uint256 projectId) external nonReentrant {
        Project storage p = projects[projectId];
        require(p.status == ProjectStatus.Active, "project not active");
        require(msg.sender == p.ngoAddr, "not project NGO");

        p.status = ProjectStatus.Closed;
        p.closedAt = block.timestamp;

        uint256 remaining = p.remainingFunds;
        uint256 deposit = p.deposit;

        p.remainingFunds = 0;
        p.deposit = 0;

        // 简化处理：全部退还给 NGO 地址
        if (remaining > 0) {
            settlementToken.safeTransfer(p.ngoAddr, remaining);
        }
        if (deposit > 0) {
            settlementToken.safeTransfer(p.ngoAddr, deposit);
        }

        emit ProjectClosed(
            projectId,
            remaining,
            deposit,
            block.timestamp
        );
    }
}
