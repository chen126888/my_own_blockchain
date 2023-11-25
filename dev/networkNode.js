const express = require('express')
const app = express()
const bodyParse = require('body-parser');
const Blockchain = require('./blockchain');
const { v4: uuidv4 } = require('uuid');
const rp = require('request-promise');
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
    const blockIndex = coin.createNewTranscation(req.body.amount,req.body.sender,req.body.recipient);
    res.json({note: "Transaction will be add in block " +blockIndex+ ".",});
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
        res.json({note: ' Transaction created and broadcast successfully.'})
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

    coin.createNewTranscation(12.5,"00",nodeAddress);

    const newBlock = coin.createNewBlock(nonce,previousBlockHash,blockHash);
    res.json({
        note: "New block mined successfully",
        block: newBlock
    });
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

app.listen(port, function(){
    console.log(`Listening on port ${port}...`);
});

