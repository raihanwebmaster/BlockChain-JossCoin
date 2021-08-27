const sha256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;

var ec = new EC("secp256k1");
class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(this.hash + "mining done");
  }
  calculateHash() {
    return sha256(
      this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce
    ).toString();
  }
  hashValuedTransaction() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
  calculateHash() {
    return sha256(this.fromAddress + this.toAddress + this.amount).toString();
  }
  signTransaction(key) {
    if (key.getPublic("hex") !== this.fromAddress) {
      throw new Error("you do not have access");
    }
    const hashTx = this.calculateHash();
    const signature = key.sign(hashTx, "base64");
    this.signature = signature.toDER();
  }
  isValid() {
    if (this.fromAddress === null) true;
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature found");
    }
    const key = ec.keyFromPublic(this.fromAddress, "hex");
    return key.verify(this.calculateHash(), this.signature);
  }
}

class BlockChain {
  constructor() {
    this.chain = [this.generateGeneratedBlock()];
    this.difficulty = 3;

    this.pendingTransactions = [];
    this.miningReword = 50;
  }

  generateGeneratedBlock() {
    return new Block("2021-01-01", "GENESIS", "0000");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Can't process Transaction");
    }
    if (!transaction.isValid()) {
      throw new Error(" Invalid transaction");
    }
    if (transaction.amount < 0) {
      throw new Error(" Invalid transaction amount");
    }
    // if(transaction.amount > this.getBalanceOfAddress(transaction.fromAddress)) {
    //     throw new Error(" Not balance");
    // }
    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(minerAddress) {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions = [
      new Transaction(null, minerAddress, this.miningReword),
    ];
  }

  //   addBlock(newBlock) {
  //     newBlock.previousHash = this.getLatestBlock().hash;
  //     // newBlock.hash = newBlock.calculateHash();
  //     newBlock.mineBlock(this.difficulty);
  //     this.chain.push(newBlock);
  //   }

  isBlockchainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      if (!currentBlock.hashValuedTransaction()) {
        return false;
      }
    }
    return true;
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }
}

// const josscoin = new BlockChain();
// josscoin.addTransaction(new Transaction("address1", "address2", 100));
// josscoin.addTransaction(new Transaction("address2", "address1", 50));

// const block1 = new Block("2021-01-01", { amount: 5 });
// josscoin.addBlock(block1);

// const block2 = new Block("2021-01-02", { amount: 10 });
// josscoin.addBlock(block2);
// josscoin.chain[1].data = "HACKED";

// josscoin.minePendingTransactions("nowshad-address");

// console.log(josscoin.getBalanceOfAddress("address1"));
// console.log(josscoin.getBalanceOfAddress("address2"));
// console.log(josscoin.getBalanceOfAddress("nowshad-address"));

// console.log(josscoin);

// josscoin.minePendingTransactions("nowshad-address");
// console.log(josscoin.getBalanceOfAddress("nowshad-address"));

module.exports = {
  Block,
  Transaction,
  BlockChain,
};
