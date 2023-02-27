# NFT Smart Contracts

Gas optimized NFT smart contracts.

## Development

You can easily copy and paste the contract into your existing project or to clone this project.

```bash
# clone the repo
git clone https://github.com/kodjunkie/nft-smart-contracts.git

# navigate to the repo directory
cd nft-smart-contracts

# setup env
cp .env.example .env

# install dependencies
npm install
```

## Compiling the contracts

All compiled artifacts are located in the `builds` directory.

```bash
npm run compile
```

## Deployment

NOTE: If you intend to deploy directly via this project, you must follow the instructions below.

1. Edit `migrations/2_deploy_contracts.js` and remove/comment out redundant deployments.
2. Update `.env` accordingly and run any of the commands below

```bash
# deploy to truffle network
npx truffle migrate

# deploy to truffle network using third-party wallet via HDWalletProvider
npx truffle migrate --network wallet

# deploy to truffle network using third-party wallet via Dashboard
npx truffle migrate --network dashboard

# deploy to rinkeby network via Infura
npx truffle migrate --network rinkeby
```

More deployment configurations can be added to the `networks` object in the `truffle-config.js` file.

## Tests

```bash
npm test
```

## License

Copyright (c) 2022 <a href="https://github.com/kodjunkie/nft-smart-contracts/blob/master/LICENSE" target="_blank">MIT</a>, <a href="https://github.com/kodjunkie" target="_blank">Lawrence Onah</a>
