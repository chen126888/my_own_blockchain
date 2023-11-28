const express = require('express')
const app = express()
const bodyParse = require('body-parser');
const Blockchain = require('./blockchain');
const { v4: uuidv4 } = require('uuid');
const rp = require('request-promise');
const requestPromise = require('request-promise');
const nodeAddress = uuidv4().split('-').join('');
const coin = new Blockchain();
//process是start的指令，ex:nodemon --watch dev -e js dev/api.js 3001
const port = process.argv[2]



app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended: false}));

app.get('/blockchain', function (req, res) {
  res.send(coin);
});

app.post('/transaction', function (req, res) {
    const newTransaction = req.body;
    const blockIndex=coin.addTransactionToPendingTransations(newTransaction);
    res.json({note: `Transaction wil be added in block ${blockIndex}.`})
});

app.post('/transaction/broadcast', function(req,res){
    const newTransaction = coin.createNewTranscation(req.body.amount,req.body.sender,req.body.recipient);
    coin.addTransactionToPendingTransations(newTransaction);
   
    const requestPromises = [];
    coin.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            url: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(data => {
        res.json({note: 'Transaction created and broadcast successfully.'})
    });
});

app.get('/mine', function (req, res) {
    const lastBlock = coin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: coin.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = coin.proofOfWork(previousBlockHash,currentBlockData);
    const blockHash = coin.hashBlock(previousBlockHash,currentBlockData,nonce);

    const newBlock = coin.createNewBlock(nonce,previousBlockHash,blockHash);
    const requestPromises=[];
    coin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions = {
            url: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: {newBlock: newBlock},
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data =>{
        const requestOptions = {
            url: coin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body:{
                amount:12.5,
                sender:"00",
                recipient:nodeAddress
            },
            json:true
        };
        return rp(requestOptions);
    })
    .then(data =>{
        res.json({
            note: "New block mined & broadcast successfully",
            block: newBlock
        });
    });

});

app.post('/receive-new-block', function(req,res){
    const newBlock = req.body.newBlock;
    const lastBlock = coin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index']+1 === newBlock['index'];
    if (correctHash&&correctIndex){
        coin.chain.push(newBlock);
        coin.pendingTransactions=[];
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        });
    }else{
        res.json({
            note:'New blcok rejected.',
            newBlock:newBlock
        });
    }
});

// register a node and broadcast it the network
app.post('/register-and-broadcast-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    if(coin.networkNodes.indexOf(newNodeUrl) == -1) coin.networkNodes.push(newNodeUrl);
    
    const regNodesPromise = [];
    coin.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            url:networkNodeUrl + '/register-node',
            method: 'POST',
            body:{newNodeUrl:newNodeUrl},
            json: true
        };
        regNodesPromise.push(rp(requestOptions));

    });
    Promise.all(regNodesPromise)
    .then(data =>{
        const bulkRegisterOptions = {
          url: newNodeUrl+'/register-nodes-bulk',
          method: 'POST',
          body:{ allNetworkNodes:[ ...coin.networkNodes,coin.currentNodeUrl]},
          json: true  
        };
        return rp(bulkRegisterOptions);        
    })
    .then(data =>{
        res.json({note:"New node registered with network successfully."});
    });
});

// register a node with the network
app.post('/register-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent=coin.networkNodes.indexOf(newNodeUrl)==-1
    const notCurrentNode = coin.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode) coin.networkNodes.push(newNodeUrl);
    res.json({
        note: "New node register successfully with node."
    });
    
});

// register multiple nodes at once ，send all of the node 
// that are already present in the network to the new node
app.post('/register-nodes-bulk',function(req,res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl =>{
        const nodeNotAlreadyPresent = coin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = coin.currentNodeUrl !== networkNodeUrl;
        if(nodeNotAlreadyPresent&&notCurrentNode) coin.networkNodes.push(networkNodeUrl);
    });
    res.json({
        note: "Bulk registration successful."
    });
}); 

//the longest chain rule
app.get('/consensus',function(req,res){
    const requestPromise=[];
    coin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            url: networkNodeUrl+'/blockchain',
            method:'GET',
            json:true
        };
        requestPromise.push(rp(requestOptions));
    });
    Promise.all(requestPromise)
    .then(blockchains =>{
        const currentChainLength = coin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain= null;
        let newPendingTransactions = null;
        
        blockchains.forEach(blockchain =>{
            if(blockchain.chain.length > maxChainLength){
                maxChainLength=blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions=blockchain.pendingTransactions;
            };
        });
        if(!newLongestChain||(newLongestChain&&!coin.chainIsValid(newLongestChain))){
            res.json({
                note: 'Current chain has been rejected.',
                chain:coin.chain
            });
        }else{
            coin.chain=newLongestChain;
            coin.pendingTransactions=newPendingTransactions;
            res.json({
                note: 'This chain has been replaced.',
                chain:coin.chain
            });
        }

    });
});

app.get('/block/:blockHash',function(req,res){
    const blockHash = req.params.blockHash;
    const correctBlock = coin.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

app.get('/transaction/:transactionId',function(req,res){
    const transacionId = req.params.transactionId;
    const transactionData = coin.getTransaction(transacionId);
    res.json({
        transaction: transactionData.transaction,
        block:transactionData.block
    });

});

app.get('/address/:address',function(req,res){
    const address = req.params.address;
    const addressData = coin.getAddressData(address);
    res.json({
        addressData:addressData
    });
});

app.get('/block-explorer',function(req,res){
    //__dirname 進入目前的資料夾，找第一個參數的位址
    res.sendFile('./block-explorer/index.html',{root:__dirname})
});

app.listen(port, function(){
    console.log(`Listening on port ${port}...`);
});

