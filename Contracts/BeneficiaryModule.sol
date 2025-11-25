// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SheAidRoles.sol";
import "./PlatformAdmin.sol";
import "./Marketplace.sol";

contract BeneficiaryModule {
    SheAidRoles public roles;
    PlatformAdmin public platformAdmin;
    Marketplace public marketplace;

    // 只允许 ProjectVaultManager 调用 grantCharityToken
    address public projectVaultManager;

    // 受助人余额（内部慈善积分）
    mapping(address => uint256) public charityBalance;

    struct BeneficiaryStats {
        uint256 lastSpendTimestamp;
        uint256 dailySpent;
        uint256 lastResetDay;
    }

    mapping(address => BeneficiaryStats) public stats;

    uint256 public cooldownSeconds;
    uint256 public dailyLimit;

    // 事件
    event ProjectVaultManagerSet(address indexed vault);

    event CharityTokenGranted(
        address indexed beneficiary,
        uint256 amount,
        uint256 indexed projectId,
        uint256 timestamp
    );

    event CharityTokenSpent(
        address indexed beneficiary,
        address indexed merchant,
        uint256 indexed productId,
        uint256 quantity,
        uint256 amount,
        uint256 timestamp
    );

    constructor(
        SheAidRoles _roles,
        PlatformAdmin _platformAdmin,
        Marketplace _marketplace
    ) {
        roles = _roles;
        platformAdmin = _platformAdmin;
        marketplace = _marketplace;
    }

    modifier onlyPlatformAdmin() {
        require(
            roles.hasRole(roles.PLATFORM_ADMIN_ROLE(), msg.sender),
            "Not platform admin"
        );
        _;
    }

    modifier onlyProjectVaultManager() {
        require(msg.sender == projectVaultManager, "Not ProjectVaultManager");
        _;
    }

    // ========= 配置 =========

    function setProjectVaultManager(address vault) external onlyPlatformAdmin {
        require(vault != address(0), "zero address");
        projectVaultManager = vault;
        emit ProjectVaultManagerSet(vault);
    }

    function setCooldownSeconds(uint256 value) external onlyPlatformAdmin {
        cooldownSeconds = value;
    }

    function setDailyLimit(uint256 value) external onlyPlatformAdmin {
        dailyLimit = value;
    }

    // ========= 发积分（仅项目资金池调用） =========

    function grantCharityToken(
        address beneficiary,
        uint256 amount,
        uint256 projectId
    ) external onlyProjectVaultManager {
        require(beneficiary != address(0), "beneficiary zero");
        require(amount > 0, "amount zero");

        charityBalance[beneficiary] += amount;

        emit CharityTokenGranted(
            beneficiary,
            amount,
            projectId,
            block.timestamp
        );
    }

    // ========= 受助人消费 =========

    function spendCharityToken(
        uint256 productId,
        uint256 quantity
    ) external {
        require(
            roles.hasRole(roles.BENEFICIARY_ROLE(), msg.sender),
            "Not beneficiary"
        );
        require(quantity > 0, "quantity zero");
        require(
            !platformAdmin.isBeneficiaryBlacklisted(msg.sender),
            "Beneficiary blacklisted"
        );

        // 从 Marketplace 查询商品信息
        (address merchant, , uint256 price, bool active) = marketplace.getProduct(
            productId
        );
        require(merchant != address(0), "product not exist");
        require(active, "product inactive");
        require(price > 0, "price is zero");

        uint256 totalPaid = price * quantity;

        _updateStatsAndCheck(msg.sender, totalPaid);

        uint256 balance = charityBalance[msg.sender];
        require(balance >= totalPaid, "insufficient charity balance");

        charityBalance[msg.sender] = balance - totalPaid;

        // 记账给 Marketplace（给商户加余额）
        marketplace.recordPurchase(
            msg.sender,
            productId,
            quantity,
            totalPaid
        );

        emit CharityTokenSpent(
            msg.sender,
            merchant,
            productId,
            quantity,
            totalPaid,
            block.timestamp
        );
    }

    // ========= 风控：冷却期 + 每日限额 =========

    function _updateStatsAndCheck(
        address beneficiary,
        uint256 amount
    ) internal {
        BeneficiaryStats storage s = stats[beneficiary];

        // 冷却期检查
        if (cooldownSeconds > 0 && s.lastSpendTimestamp != 0) {
            require(
                block.timestamp >= s.lastSpendTimestamp + cooldownSeconds,
                "cooldown not passed"
            );
        }

        // 天编号（按 UTC 时间戳/86400）
        uint256 currentDay = block.timestamp / 1 days;
        if (s.lastResetDay < currentDay) {
            s.lastResetDay = currentDay;
            s.dailySpent = 0;
        }

        if (dailyLimit > 0) {
            uint256 newDaily = s.dailySpent + amount;
            require(newDaily <= dailyLimit, "daily limit exceeded");
            s.dailySpent = newDaily;
        } else {
            s.dailySpent += amount;
        }

        s.lastSpendTimestamp = block.timestamp;
    }

    // ========= 辅助查询（前端用） =========

    function getStats(address beneficiary)
        external
        view
        returns (
            uint256 lastSpendTimestamp,
            uint256 dailySpent,
            uint256 lastResetDay
        )
    {
        BeneficiaryStats storage s = stats[beneficiary];
        return (s.lastSpendTimestamp, s.dailySpent, s.lastResetDay);
    }
}
