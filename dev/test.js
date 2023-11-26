const Blockchain = require("./blockchain");

const coin = new Blockchain();

const bc1={
    "chain": [
    {
    "index": 1,
    "timestamp": 1701011938774,
    "transaction": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1701011963088,
    "transaction": [],
    "nonce": 9073720316,
    "hash": "6e457f9c8ba05f0b70bd704244754ef5e39f6df85507812ba6774223213b9454",
    "previousBlockHash": "0"
    },
    {
    "index": 3,
    "timestamp": 1701012004168,
    "transaction": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "7b168105e7e44d1cb6b9c82e5104f0f5",
    "transacionId": "cdd273f1b3de4686b85bedd955a67dd3"
    },
    {
    "amount": 135,
    "sender": "0fdsfds0",
    "recipient": "dfb131",
    "transacionId": "c5076b7a07e14e68b6bdc8bac3bc31c1"
    },
    {
    "amount": 35,
    "sender": "0fdsfds0",
    "recipient": "dfb131",
    "transacionId": "06f199bd3adb4edeba9d4fe9b81b0ea1"
    }
    ],
    "nonce": 5202882211,
    "hash": "ae301d0755c392063c550ccd6bae2a4188e24c104a69ea9dd23f75318108db51",
    "previousBlockHash": "6e457f9c8ba05f0b70bd704244754ef5e39f6df85507812ba6774223213b9454"
    },
    {
    "index": 4,
    "timestamp": 1701012038550,
    "transaction": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "7b168105e7e44d1cb6b9c82e5104f0f5",
    "transacionId": "98ce7886f31a417ea9936922af51b43e"
    },
    {
    "amount": 55,
    "sender": "0fdsfds0",
    "recipient": "dfb131",
    "transacionId": "f036690f84bc4209b8c5fb3dbfd6d7e6"
    },
    {
    "amount": 553,
    "sender": "0fdsfds0",
    "recipient": "dfb131",
    "transacionId": "5f99fbecdab849c69e31744f6064ea93"
    },
    {
    "amount": 5532,
    "sender": "0fdsfds0",
    "recipient": "dfb131",
    "transacionId": "aa38489945e14789920fd9d4c5101de4"
    },
    {
    "amount": 32,
    "sender": "0fdsfds0",
    "recipient": "dfb131",
    "transacionId": "5a9d838be7104e20a05b9fb5221e5c32"
    }
    ],
    "nonce": 9614748486,
    "hash": "65c96cd3c02ccb3b8c4988c729809da877d7278e62a3c01f2491febf905273c3",
    "previousBlockHash": "ae301d0755c392063c550ccd6bae2a4188e24c104a69ea9dd23f75318108db51"
    },
    {
    "index": 5,
    "timestamp": 1701012053502,
    "transaction": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "7b168105e7e44d1cb6b9c82e5104f0f5",
    "transacionId": "638bc7017f17458db27d8ccac73ec594"
    }
    ],
    "nonce": 9287451053,
    "hash": "95a352c1c92073018b611d82b58928c59cc683d145af26781918fb9dc77c390b",
    "previousBlockHash": "65c96cd3c02ccb3b8c4988c729809da877d7278e62a3c01f2491febf905273c3"
    },
    {
    "index": 6,
    "timestamp": 1701012055604,
    "transaction": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "7b168105e7e44d1cb6b9c82e5104f0f5",
    "transacionId": "028306075d154a689e06ac8af02539ca"
    }
    ],
    "nonce": 4626967225,
    "hash": "796f738a1e208c21bc40db3e7bf0b20362ed322e1b48f46df4ec89c08bcec5c9",
    "previousBlockHash": "95a352c1c92073018b611d82b58928c59cc683d145af26781918fb9dc77c390b"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "7b168105e7e44d1cb6b9c82e5104f0f5",
    "transacionId": "528546f5b218453da15fd858db827c1d"
    }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
};

console.log('valid: ',coin.chainIsValid(bc1.chain));

