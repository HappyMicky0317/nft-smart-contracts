const BN = web3.utils.BN;
const chai = require("chai");

chai.use(require("chai-bn")(BN));
chai.use(require("chai-as-promised"));

chai.config.includeStack = true;

module.exports = chai;
