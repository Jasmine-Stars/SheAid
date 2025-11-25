// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./SheAidRoles.sol";

contract Marketplace is ReentrancyGuard {
    using SafeERC20 for IERC20;

    SheAidRoles public roles;
    IERC20 public settlementToken;

    // 由平台设置的价格类目
    struct PriceCategory {
        uint256 basePrice;    // 基础价
        uint256 maxUpBps;     // 允许上涨百分比（bps）
        uint256 maxDownBps;   // 允许下降百分比（bps）
        bool exists;
    }

    mapping(bytes32 => PriceCategory) public categories;

    // 商品
    struct Product {
        uint256 id;
        address merchant;
        bytes32 category;
        uint256 price;
        bool active;
        string metadata;
    }

    uint256 public nextProductId;
    mapping(uint256 => Product) public products;

    // 商户在平台上的应收余额（单位与 settlementToken 一致）
    mapping(address => uint256) public merchantBalance;

    // 只允许 BeneficiaryModule 调用 recordPurchase
    address public beneficiaryModule;

    // --- 事件 ---

    event BeneficiaryModuleSet(address indexed module);

    event PriceCategoryUpdated(
        bytes32 indexed categoryId,
        uint256 basePrice,
        uint256 maxUpBps,
        uint256 maxDownBps,
        uint256 timestamp
    );

    event ProductListed(
        uint256 indexed productId,
        address indexed merchant,
        bytes32 indexed categoryId,
        uint256 price,
        string metadata,
        uint256 timestamp
    );

    event ProductPriceUpdated(
        uint256 indexed productId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );

    event ProductActiveChanged(
        uint256 indexed productId,
        bool active,
        uint256 timestamp
    );

    event PurchaseRecorded(
        address indexed buyer,
        address indexed merchant,
        uint256 indexed productId,
        uint256 quantity,
        uint256 totalPaid,
        uint256 timestamp
    );

    event MerchantWithdrawn(
        address indexed merchant,
        uint256 amount,
        uint256 timestamp
    );

    constructor(SheAidRoles _roles, IERC20 _settlementToken) {
        roles = _roles;
        settlementToken = _settlementToken;
    }

    modifier onlyPlatformAdmin() {
        require(
            roles.hasRole(roles.PLATFORM_ADMIN_ROLE(), msg.sender),
            "Not platform admin"
        );
        _;
    }

    modifier onlyBeneficiaryModule() {
        require(msg.sender == beneficiaryModule, "Not BeneficiaryModule");
        _;
    }

    // ========== 配置关联模块 ==========

    function setBeneficiaryModule(address _beneficiaryModule) external onlyPlatformAdmin {
        require(_beneficiaryModule != address(0), "zero address");
        beneficiaryModule = _beneficiaryModule;
        emit BeneficiaryModuleSet(_beneficiaryModule);
    }

    // ========== 价格类目（平台设置） ==========

    function setPriceCategory(
        bytes32 categoryId,
        uint256 basePrice,
        uint256 maxUpBps,
        uint256 maxDownBps
    ) external onlyPlatformAdmin {
        require(categoryId != bytes32(0), "empty category");
        PriceCategory storage cat = categories[categoryId];
        cat.basePrice = basePrice;
        cat.maxUpBps = maxUpBps;
        cat.maxDownBps = maxDownBps;
        cat.exists = true;

        emit PriceCategoryUpdated(
            categoryId,
            basePrice,
            maxUpBps,
            maxDownBps,
            block.timestamp
        );
    }

    // ========== 商品上架 / 改价 / 上下架 ==========

    function listProduct(
        bytes32 categoryId,
        uint256 price,
        string calldata metadata
    ) external returns (uint256 productId) {
        require(
            roles.hasRole(roles.MERCHANT_ROLE(), msg.sender),
            "Not merchant"
        );
        require(categories[categoryId].exists, "category not set");
        require(price > 0, "price is zero");
        require(_priceInRange(categoryId, price), "price out of range");

        productId = nextProductId;
        nextProductId += 1;

        products[productId] = Product({
            id: productId,
            merchant: msg.sender,
            category: categoryId,
            price: price,
            active: true,
            metadata: metadata
        });

        emit ProductListed(
            productId,
            msg.sender,
            categoryId,
            price,
            metadata,
            block.timestamp
        );
    }

    function updateProductPrice(
        uint256 productId,
        uint256 newPrice
    ) external {
        Product storage p = products[productId];
        require(p.merchant != address(0), "product not exist");
        require(msg.sender == p.merchant, "not product merchant");
        require(newPrice > 0, "price is zero");
        require(categories[p.category].exists, "category not set");
        require(_priceInRange(p.category, newPrice), "price out of range");

        uint256 oldPrice = p.price;
        p.price = newPrice;

        emit ProductPriceUpdated(productId, oldPrice, newPrice, block.timestamp);
    }

    function setProductActive(
        uint256 productId,
        bool active
    ) external {
        Product storage p = products[productId];
        require(p.merchant != address(0), "product not exist");
        require(msg.sender == p.merchant, "not product merchant");

        p.active = active;
        emit ProductActiveChanged(productId, active, block.timestamp);
    }

    // 供 BeneficiaryModule 查询商品信息
    function getProduct(uint256 productId)
        external
        view
        returns (address merchant, bytes32 categoryId, uint256 price, bool active)
    {
        Product storage p = products[productId];
        return (p.merchant, p.category, p.price, p.active);
    }

    // ========== 被 BeneficiaryModule 调用：记录消费 ==========

    function recordPurchase(
        address buyer,
        uint256 productId,
        uint256 quantity,
        uint256 totalPaid
    ) external onlyBeneficiaryModule {
        require(quantity > 0, "quantity zero");
        require(totalPaid > 0, "totalPaid zero");

        Product storage p = products[productId];
        require(p.merchant != address(0), "product not exist");
        require(p.active, "product inactive");

        merchantBalance[p.merchant] += totalPaid;

        emit PurchaseRecorded(
            buyer,
            p.merchant,
            productId,
            quantity,
            totalPaid,
            block.timestamp
        );
    }

    // ========== 商户提现 ==========

    function merchantWithdraw(uint256 amount) external nonReentrant {
        require(
            roles.hasRole(roles.MERCHANT_ROLE(), msg.sender),
            "Not merchant"
        );
        require(amount > 0, "amount is zero");
        uint256 balance = merchantBalance[msg.sender];
        require(balance >= amount, "insufficient balance");

        merchantBalance[msg.sender] = balance - amount;
        settlementToken.safeTransfer(msg.sender, amount);

        emit MerchantWithdrawn(msg.sender, amount, block.timestamp);
    }

    // ========== 内部函数：价格区间检查 ==========

    function _priceInRange(bytes32 categoryId, uint256 price) internal view returns (bool) {
        PriceCategory storage cat = categories[categoryId];
        if (!cat.exists) {
            return false;
        }
        uint256 base = cat.basePrice;
        if (base == 0) {
            // 若 basePrice = 0，则直接允许任何价格（MVP 简化用法）
            return true;
        }

        // 允许区间：[base * (1 - maxDownBps/10000), base * (1 + maxUpBps/10000)]
        uint256 maxUp = base + (base * cat.maxUpBps) / 10000;
        uint256 maxDown = base - (base * cat.maxDownBps) / 10000;

        if (price > maxUp) return false;
        if (price < maxDown) return false;
        return true;
    }
}
