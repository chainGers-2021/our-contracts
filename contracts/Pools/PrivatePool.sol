// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

/***
 * Factory Contract for creating private pools
 * @author Chinmay Vemuri
 */

contract PrivatePool {
    enum State {ACTIVE, BROKEN}
    State public currState;
    address public owner;
    address public token;
    address public accountAddress; /// @dev Necessary for inviting people
    string public poolName;
    uint256 public targetPrice;
    uint256 public currPrice; /// @dev To be assigned from the Chainlink price feeds data
    bool public initialized;

    mapping(address => uint256) public userDeposits;
    mapping(address => bool) public verified;
    mapping(bytes32 => bool) public signatures; /// @dev Necessary to check reuse of any signature by unauthorized users

    modifier checkState(
        State _currState /// @dev This function may not be necessary
    ) {
        require(
            currState == _currState,
            "Function not available in this state"
        );
        _;
    }

    modifier changeState {
        if (currState == State.ACTIVE && currPrice >= targetPrice)
            currState = State.BROKEN;
        _;
    }

    function init(
        address _owner,
        address _token,
        string calldata _poolName,
        uint256 _targetPrice,
        address _accountAddress
    ) external {
        require(!initialized, "Pool already initialized !");

        currState = State.ACTIVE;
        owner = _owner;
        token = _token;
        poolName = _poolName;
        targetPrice = _targetPrice;
        accountAddress = _accountAddress;

        verified[_owner] = true;
    }

    function poolVerify(
        address _sender,
        bytes32 _messageHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bool) {
        require(!verified[msg.sender], "Sender already verified !");
        require(
            !signatures[_messageHash],
            "Unauthorized access: Reusing signature"
        );

        if (ecrecover(_messageHash, v, r, s) == accountAddress) {
            verified[_sender] = true;
            signatures[_messageHash] = true;

            return true;
        } else return false;
    }
}
