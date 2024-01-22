pragma solidity 0.8.18;

contract Inheritance {
    address public owner;
    address public heir;
    uint256 public lastWithdrawTime;

    event OwnerChanged(address indexed _oldOwner, address indexed _newOwner);
    event HeirChanged(address indexed _oldHeir, address indexed _newHeir);
    event Withdraw(address indexed _owner, uint256 indexed _amount);

    modifier onlyOwner() {
        uint256 diff = block.timestamp - lastWithdrawTime;
        address _owner = owner;
        if (diff > 30 * 24 * 60 * 60) {
            _owner = heir;
            setOwner(heir);
        }
        require(msg.sender == _owner, "Not owner");
        _;
    }

    constructor() {
        setOwner(msg.sender);
    }

    receive() external payable {}

    function setOwner(address account) private {
        emit OwnerChanged(owner, account);
        owner = account;
        lastWithdrawTime = block.timestamp;
    }

    function setHeir(address account) external onlyOwner {
        emit HeirChanged(heir, account);
        heir = account;
    }

    function withdraw(uint256 amount) external onlyOwner {
        _safeTransferETH(msg.sender, amount);
        lastWithdrawTime = block.timestamp;
        emit Withdraw(msg.sender, amount);
    }

    function _safeTransferETH(address to, uint256 value) private {
        (bool success, ) = to.call{value: value}("");
        require(success, "ETH send failed");
    }
}
