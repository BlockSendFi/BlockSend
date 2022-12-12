const MyToken = artifacts.require("./BlockSendToken.sol");
const { BN, expectRevert, expectEvent } = require('../node_modules/@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('BlockSendToken', accounts => {
    const _name = "BlockSendToken";
    const _symbol = "BKSD";
    const _initialSupply = new BN(0);
    const _owner = accounts[0];
    const _recipient = accounts[1];
    const _decimal = new BN(18);

    let myTokenInstance;

    beforeEach(async function () {
        myTokenInstance = await MyToken.new({ from: _owner });
    });

    it("has a name", async () => {
        expect(await myTokenInstance.name()).to.equal(_name);
    });

    it("has a symbol", async () => {
        expect(await myTokenInstance.symbol()).to.equal(_symbol);
    });

    it("has a decimal", async () => {
        expect(await myTokenInstance.decimals()).to.be.bignumber.equal(_decimal);
    });

    it("check first balance", async () => {
        expect(await myTokenInstance.balanceOf(_owner)).to.be.bignumber.equal(_initialSupply);
    });

    it("check balance after transfer", async () => {
        let amount = new BN(100);

        await myTokenInstance.setMinter(_owner);
        await myTokenInstance.mint(_owner, amount);

        let balanceOwnerBeforeTransfer = await myTokenInstance.balanceOf(_owner);
        let balanceRecipientBeforeTransfer = await myTokenInstance.balanceOf(_recipient);

        expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));

        await myTokenInstance.transfer(_recipient, new BN(100), { from: _owner });

        let balanceOwnerAfterTransfer = await myTokenInstance.balanceOf(_owner);
        let balanceRecipientAfterTransfer = await myTokenInstance.balanceOf(_recipient)

        expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
        expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
    });

    it("check approval done", async () => {
        let amount = new BN(100);
        let allowanceBeforeApproval = await myTokenInstance.allowance(_owner, _recipient);
        expect(allowanceBeforeApproval).to.be.bignumber.equal(new BN(0));

        await myTokenInstance.approve(_recipient, amount);

        let allowanceAfterApproval = await myTokenInstance.allowance(_owner, _recipient);
        expect(allowanceAfterApproval).to.be.bignumber.equal(amount);
    });

    it("check if transferFrom done", async () => {
        let amount = new BN(100);

        await myTokenInstance.setMinter(_owner);
        await myTokenInstance.mint(_owner, amount);

        await myTokenInstance.approve(_recipient, amount);

        let balanceOwnerBeforeTransfer = await myTokenInstance.balanceOf(_owner);
        let balanceRecipientBeforeTransfer = await myTokenInstance.balanceOf(_recipient)
        expect(balanceOwnerBeforeTransfer).to.be.bignumber.equal(amount);
        expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));

        await myTokenInstance.transferFrom(_owner, _recipient, amount, { from: _recipient })

        let balanceOwnerAfterTransfer = await myTokenInstance.balanceOf(_owner);
        let balanceRecipientAfterTransfer = await myTokenInstance.balanceOf(_recipient)

        expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
        expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
    });

    it("check mint done", async () => {
        let amount = new BN(100);

        await myTokenInstance.setMinter(_owner);

        let balanceOwnerBeforeMint = await myTokenInstance.balanceOf(_owner);
        expect(balanceOwnerBeforeMint).to.be.bignumber.equal(new BN(0));

        await myTokenInstance.mint(_owner, amount);

        let balanceOwnerAfterMint = await myTokenInstance.balanceOf(_owner);
        expect(balanceOwnerAfterMint).to.be.bignumber.equal(balanceOwnerBeforeMint.add(amount));
    });

    it("check only minter done", async () => {
        try {
            let amount = new BN(100);
            await myTokenInstance.mint(_owner, amount);
        } catch (e) {
            console.log("Only minter can mint")
        }
    });

    it("check pause and unpause done", async () => {
        let amount = new BN(100);
        await myTokenInstance.pause();
        try {
            await myTokenInstance.mint(_owner, amount);
        } catch (e) {
            console.log("Pausable: paused")
        }
    });

    it("check pause and unpause done", async () => {
        let amount = new BN(100);
        await myTokenInstance.pause();
        await myTokenInstance.unpause();

        await myTokenInstance.setMinter(_owner);
        await myTokenInstance.mint(_owner, amount);
        let balanceOwner = await myTokenInstance.balanceOf(_owner);
        expect(balanceOwner).to.be.bignumber.equal(amount);
    });

});
