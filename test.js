const { Block, Transaction, BlockChain } = require("./index");

const EC = require("elliptic").ec;

var ec = new EC("secp256k1");

const key1 = ec.genKeyPair();
const privateKey1 = key1.getPrivate("hex");
const walletNumber1 = key1.getPublic("hex");

const key2 = ec.genKeyPair();
const privateKey2 = key2.getPrivate("hex");
const walletNumber2 = key2.getPublic("hex");

const josscoin = new BlockChain();

const tx1 = new Transaction(walletNumber1, walletNumber2, 100);
tx1.signTransaction(key1);
josscoin.addTransaction(tx1);

josscoin.minePendingTransactions(walletNumber1);

const tx2= new Transaction(walletNumber2, walletNumber1, 100);
tx2.signTransaction(key2);
josscoin.addTransaction(tx2);

console.log(josscoin.getBalanceOfAddress(walletNumber1));
console.log(josscoin.getBalanceOfAddress(walletNumber2));

josscoin.minePendingTransactions(walletNumber1);

console.log(josscoin.getBalanceOfAddress(walletNumber1));
console.log(josscoin.getBalanceOfAddress(walletNumber2));

// josscoin.chain[1].transactions[1] = "HACKED";

// console.log(josscoin.isBlockchainValid());
// console.log(josscoin.getBalanceOfAddress("randomAddress"));
console.log(josscoin.isBlockchainValid());
