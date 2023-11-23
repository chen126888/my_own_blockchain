const express = require('express')
const app = express()
const bodyParse = require('body-parser');
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended: false}));
const Blockchain = require('./blockchain');
const { v4: uuidv4 } = require('uuid');
const nodeAddress = uuidv4().split('-').join('');
const coin = new Blockchain();

app.get('/blockchain', function (req, res) {
  res.send(coin);
});

app.post('/transaction', function (req, res) {
    const blockIndex = coin.createNewTranscation(req.body.amount,req.body.sender,req.body.recipient);
    res.json({note: "Transaction will be add in block " +blockIndex+ ".",});
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
 

app.listen(3000, function(){
    console.log('Listening on port 3000...');
});

