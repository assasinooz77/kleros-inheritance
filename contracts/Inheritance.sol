pragma solidity 0.8.18;

/**
 * @author Peter Xiao
 * @title {Inheritance} allows the owner to withdraw ETH from the contract.
 *          If the owner does not withdraw ETH from the contract for more than 1 month,
 *          an heir can take control of the contract and designate a new heir.
 */
contract Inheritance {
    address public owner;
    address public heir;
    uint256 public lastWithdrawTime;

    event OwnerChanged(address indexed _oldOwner, address indexed _newOwner);
    event HeirChanged(address indexed _oldHeir, address indexed _newHeir);
    event Withdraw(address indexed _owner, uint256 indexed _amount);

    /**
     * @dev Initialize the owner as the deployer
     */
    constructor() {
        setOwner(msg.sender);
    }

    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {}

    /**
     * @notice Check if the owner does not withdraw ETH from the contract for more than 1 month,
     *          hand over the owner role to the heir.
     */
    function checkOwner() private returns (bool) {
        uint256 diff = block.timestamp - lastWithdrawTime;
        address _owner = owner;
        if (diff > 30 * 24 * 60 * 60) {
            _owner = heir;
            setOwner(heir);
        }
        return msg.sender == _owner;
    }

    /**
     * @notice Sets the owner address. Can only be called inside the contract.
     * @param account The address to be the owner.
     */
    function setOwner(address account) private {
        emit OwnerChanged(owner, account);
        owner = account;
        lastWithdrawTime = block.timestamp;
    }

    /**
     * @notice Sets the heir address. Only owner can update the heir.
     *          If the owner does not withdraw ETH from the contract for more than 1 month,
     *          hand over the owner role to the heir.
     * @param account The address to be the heir.
     */
    function setHeir(address account) external returns (bool) {
        if (!checkOwner()) {
            return false;
        }
        emit HeirChanged(heir, account);
        heir = account;
        return true;
    }

    /**
     * @notice Withdraws ETH from the contract. Only owner can withdraw.
     *          If the owner does not withdraw ETH from the contract for more than 1 month,
     *          hand over the owner role to the heir.
     * @param amount The amount of ETH to be withdrawn. Can be zero amount.
     */
    function withdraw(uint256 amount) external returns (bool) {
        if (!checkOwner()) {
            return false;
        }
        msg.sender.call{value: amount}("");
        lastWithdrawTime = block.timestamp;
        emit Withdraw(msg.sender, amount);
        return true;
    }
}
