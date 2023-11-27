const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const { v4: uuidv4 } = require('uuid');

function Blockchain(){
    this.chain=[];
    this.pendingTransactions=[];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes=[];
    this.createNewBlock(100,'0','0');
}

Blockchain.prototype.createNewBlock = function(nonce,previousBlockHash,hash){
    const newBlock = {
       //block number
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transaction: this.pendingTransactions,
        nonce: nonce,//交易中=>序次，表示這個「來自地址」截至本交易為止，已發送了n筆交易
                    //number once 的簡寫，在加密學裡，nonce 指的是只能使用一次的任意數
        hash:hash,
        previousBlockHash:previousBlockHash

    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
}

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTranscation = function(amount,sender,recipient){
    const newTransaction = { 
        amount: amount,
        sender: sender,
        recipient: recipient,
        transacionId: uuidv4().split('-').join('')    
    };
    
    return newTransaction;  
}

Blockchain.prototype.addTransactionToPendingTransations = function(transactionObj){
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index']+1;
}

Blockchain.prototype.hashBlock = function(previousBlockHash,currentBlockData,nonce){
    const dataAsString = previousBlockHash + nonce.toString + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
}

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
    //true way of pof
    //correct hash start with 0000
    //continue changes nonce value until it finds the correct hash
    /*let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while(hash.substring(0, 4)!=='0000'){
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }*/
    //for testing, an alternative way to produce none
    let nonce = Math.floor(Math.random()*10000000000);
    return nonce;
}

Blockchain.prototype.chainIsValid = function(blockchain){
    let validChain =true;
    for(var i =1; i<blockchain.length;i++){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i-1];
        // for test we ignore this, cause this could made lots computation
        //const blockHash=this.hashBlock(prevBlock['hash'],{transactions: currentBlock['transactions'],index: currentBlock['index']},currentBlock['nonce']);
        //if(blockHash.substring(0,4)!=='0000') validChain=false;
        if(currentBlock['previousBlockHash']!==prevBlock['hash']) validChain=false;

    };
    const genesisBlock=blockchain[0];
    const correctNonce=genesisBlock['nonce']===100;
    const correctPreviosBlockHah=genesisBlock['previousBlockHash']==='0';
    const correctHash=genesisBlock['hash']==='0';
    const correctTransactions=genesisBlock['transaction'].length===0;

    if(!correctHash||!correctNonce||!correctPreviosBlockHah||!correctTransactions) validChain=false;

    return validChain
};


Blockchain.prototype.getBlock=function(blockHash){
    let correctBlock= null;
    this.chain.forEach(block =>{
        if(blockHash===block.hash) correctBlock=block;
    });
    return correctBlock;
}


module.exports = Blockchain;