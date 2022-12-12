# Blocksend

## Presentation

BlockSend allow you to send money abroad with reduce fees and transparency. The application used the blockchain technology to transfer value without slippage and with a low cost.

## Context

This project is the final project for the Alyra certification, the subject was free but must used blockchain technology.

## Objective

The objective was to have a simple application that allow user to send money abroad with a low cost and transparency. We build simple interface allow the user to add contact and then program a transaction.

## Organization
To share, organize, collaborate and track the progress of the project:
- [Board Trello](https://trello.com/b/18tZQRRh/blocksend-suivi-dev)
- [Documentation](https://blocksend.atlassian.net/wiki/spaces/BLOCKSEND/pages/426049/Sommaire)
- [Figma](https://www.figma.com/file/V8fQ5aJYz9IreIc5WkJLf7/ASHLEY_WK_061222?node-id=0%3A1)

## Architecture

We choose to have an hybrid architecture with a smart contract on the blockchain and a backend to store some confidential data in a centralised database.
![alt text](./docs/architeture.png)


## Getting Started

1. Install test and solidity dependencies
    ```
    npm install
    ```
1. Install [Truffle](http://truffleframework.com)
    ```
    npm install -g truffle
    ```
1. Migrate the contracts with truffle.
    ```
    truffle migrate --network 'network_name'
    ```
1. Run the webpack server for front-end hot reloading
    ```
    npm run dev
    ```

## Tests
This box comes with `truffle` contracts testing and front-end testing with `jest`
1. Truffle contract tests
    ```
    truffle test
    ```

## Building for Production
1. Migrate the contracts with truffle.
    ```
    truffle migrate --network 'network_name'
    ```
1. Create production bundle
    ```
    npm run build
    ```
1. The production build will be compiled in the `build/app` folder.
    
    
## Realization

### Smart Contracts

#### BlockSend Token

#### BlockSend Router

#### BlockSend Stacking

### Front end

### Back end

### Unit tests

