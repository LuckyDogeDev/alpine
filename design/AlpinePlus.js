function mapping() {
    return new Proxy({}, {
        get: function (target, method) {
            return target[method] || 0;
        }
    });    
}

let accounts = new mapping;
accounts["GOLN-External"] = 0;
accounts["GOLN-PAIR"] = 0;
accounts["GOLN-Saver"] = 0;

class Alpine {
    constructor() {
        this.userShare = mapping();
        this.totalShare = mapping();
        this.totalAmount = mapping();
    }

    toAmount(token, share) {
        return this.totalShare[token] == 0
            ? share
            : share * this.totalAmount[token] / this.totalShare[token];
    }

    toShare(token, amount) {
        return this.totalAmount[token] == 0
            ? amount
            : amount * this.totalShare[token] / this.totalAmount[token];
    }

    deposit(token, from, to, amount) {
        accounts[token + "-" + from] -= amount;
        let share = this.toShare(token, amount);
        this.userShare[token + "-" + to] += share;
        this.totalShare[token] += share;
        this.totalAmount[token] += amount;
        return share;
    }

    withdraw(token, from, to, share) {
        let amount = this.toAmount(token, share);
        accounts[token + "-" + to] += amount;
        this.userShare[token + "-" + from] -= share;
        this.totalShare[token] -= share;
        this.totalAmount[token] -= amount;
        return amount;
    }

    withdrawAmount(token, from, to, amount) {
        accounts[token + "-" + to] += amount;
        let share = this.toShare(token, amount); // +1?
        this.userShare[token + "-" + from] -= share;
        this.totalShare[token] -= share;
        this.totalAmount[token] -= amount;
        return share;
    }

    profit(token, amount) {
        accounts[token + "-" + "External"] -= amount;
        this.totalAmount[token] += amount;
    }
}

class LendingPair {
    constructor(alp) {
        this.alp = alp;
        this.userAssetFraction = mapping();
        this.totalAssetShare = 0;
        this.totalAssetFraction = 0;

        this.userBorrowPart = mapping();
        this.totalBorrowAmount = 0;
        this.totalBorrowPart = 0

        this.asset = "GOLN";
    }

    toPart(amount) {
        return this.totalBorrowAmount == 0
            ? amount
            : amount * this.totalBorrowPart / this.totalBorrowAmount;
    }

    toAmount(part) {
        return this.totalBorrowPart == 0
            ? part
            : part * this.totalBorrowAmount / this.totalBorrowPart;
    }
   
    addAsset(user, amount) {
        let share = this.alp.deposit(this.asset, user, "PAIR", amount);
        let fraction = this.totalAssetShare == 0
            ? share
            : share * totalAssetFraction / totalAssetShare;

        this.userAssetFraction[this.asset + "-" + user] += fraction;
        this.totalAssetShare += share;
        this.totalAssetFraction += fraction;
    }

    removeAsset(user, fraction) {
        let share = fraction * this.totalAssetShare / this.totalAssetFraction;
        let borrowAmount = fraction * this.totalBorrowAmount / this.totalAssetFraction;

        let actualShare = share + this.alp.toShare("GOLN", borrowAmount);
        this.alp.withdraw(this.asset, "PAIR", user, actualShare);
        this.userAssetFraction[this.asset + "-" + user] -= fraction;
        this.totalAssetFraction -= fraction;
        this.totalAssetShare -= actualShare;
    }

    borrow(user, amount) {
        let share = this.alp.withdrawAmount(this.asset, "PAIR", user, amount);
        this.totalAssetShare -= share;
        let part = this.toPart(amount);
        this.totalBorrowAmount += amount;
        this.totalBorrowPart += part;
        this.userBorrowPart[user] += part;
    }

    repay(user, part) {
        let amount = part * this.totalBorrowAmount / this.totalBorrowPart;
        let share = this.alp.deposit(this.asset, user, "PAIR", amount);
        this.totalAssetShare += share;
        this.totalBorrowAmount -= amount;
        this.totalBorrowPart -= part;
        this.userBorrowPart[user] -= part;
    }

    accrue(percentage) {
        let amount = this.totalBorrowAmount * percentage / 100;
        this.totalBorrowAmount += amount;
    }
}

let alp = new Alpine()
let pair = new LendingPair(alp)

alp.deposit("GOLN", "Saver", "Saver", 500);
alp.profit("GOLN", 500);

pair.addAsset("Alice", 1000);
pair.borrow("Bob", 500);
alp.profit("GOLN", 500);
pair.accrue(200);
alp.profit("GOLN", 500);

pair.removeAsset("Alice", pair.userAssetFraction["GOLN-Alice"]);
pair.repay("Bob", pair.userBorrowPart["Bob"]);

alp.profit("GOLN", 500);
alp.withdraw("GOLN", "Saver","Saver",  alp.userShare["GOLN-Saver"]);
console.log(pair);
console.log(accounts);



