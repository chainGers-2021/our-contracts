contract ParentContract{
    deployedAddresses[];

    constructor(){
        
    }

    createPool(){
        new Pool();
    }
}

contract Pool{
    address immutable parentAddress;
    address private owner;

    currentStatus = {started, ended}

    constructor(_owner){
        owner = _owner;
    }

    modifier onlyOwner;

    participate(){

    }

    PayoutRedeem(tokenIndex, _sender){
        work if (ended = true)
    }

    EarlyWithdraw(tokenIndex, _sender){
        work if (started=true && participated)    
    }

    // 

    breakPool(tokenIndex, _sender){
        if status =started:
            change status to ended.
        // allow users to custom redeem 
    }
}