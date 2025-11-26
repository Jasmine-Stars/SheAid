// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SheAidRoles is AccessControl {
    // 平台超级管理员
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");
    // NGO 机构主体（或负责人）
    bytes32 public constant NGO_ROLE = keccak256("NGO_ROLE");
    // 商户
    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");
    // 受助人
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");

    address public ngoRegistry;

    address public  merchantRegistryAddress;

    function setNGORegistry(address _addr) external onlyPlatformAdmin {
        ngoRegistry = _addr;
    }

    function setMerchantRegistry(address _addr) external onlyPlatformAdmin {
        merchantRegistryAddress = _addr;
    }

    function grantNGORoleByRegistry(address ngo) external {
        // 必须是该合约地址自己发起调用才可以
        require(msg.sender == ngoRegistry, "Not NGORegistry");
        _grantRole(NGO_ROLE, ngo);
    }

    function grantMerchantRoleByRegistry(address merchant) external {
        require(msg.sender == merchantRegistryAddress, "Not registry");
        _grantRole(MERCHANT_ROLE, merchant);
    }


    constructor(address superAdmin) {
        require(superAdmin != address(0), "superAdmin is zero");
        // 默认管理员可以管理所有角色
        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(PLATFORM_ADMIN_ROLE, superAdmin);
    }

    // 方便复用的修饰符
    modifier onlyPlatformAdmin() {
        require(hasRole(PLATFORM_ADMIN_ROLE, msg.sender), "Not platform admin");
        _;
    }

    // --- 授权函数（都只给平台管理员调用） ---

    function grantPlatformAdmin(address account) external onlyPlatformAdmin {
        _grantRole(PLATFORM_ADMIN_ROLE, account);
    }

    function revokePlatformAdmin(address account) external onlyPlatformAdmin {
        _revokeRole(PLATFORM_ADMIN_ROLE, account);
    }

    function grantNGORole(address ngoAdmin) external onlyPlatformAdmin {
        _grantRole(NGO_ROLE, ngoAdmin);
    }

    function revokeNGORole(address ngoAdmin) external onlyPlatformAdmin {
        _revokeRole(NGO_ROLE, ngoAdmin);
    }

    function grantMerchantRole(address merchant) external onlyPlatformAdmin {
        _grantRole(MERCHANT_ROLE, merchant);
    }

    function revokeMerchantRole(address merchant) external onlyPlatformAdmin {
        _revokeRole(MERCHANT_ROLE, merchant);
    }

    function grantBeneficiaryRole(address beneficiary) external onlyPlatformAdmin {
        _grantRole(BENEFICIARY_ROLE, beneficiary);
    }

    function revokeBeneficiaryRole(address beneficiary) external onlyPlatformAdmin {
        _revokeRole(BENEFICIARY_ROLE, beneficiary);
    }
}
