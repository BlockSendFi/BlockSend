"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.TransferSchema = exports.Transfer = exports.Recipient = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var transfer_status_enum_1 = require("../enums/transfer-status.enum");
var Recipient = /** @class */ (function () {
    function Recipient() {
    }
    __decorate([
        (0, mongoose_1.Prop)()
    ], Recipient.prototype, "firstName");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Recipient.prototype, "lastName");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Recipient.prototype, "phoneNumber");
    Recipient = __decorate([
        (0, mongoose_1.Schema)()
    ], Recipient);
    return Recipient;
}());
exports.Recipient = Recipient;
var Transfer = /** @class */ (function () {
    function Transfer() {
    }
    __decorate([
        (0, mongoose_1.Prop)({ "default": transfer_status_enum_1.TransferStatus.INITIALIZED })
    ], Transfer.prototype, "status");
    __decorate([
        (0, mongoose_1.Prop)({ required: false })
    ], Transfer.prototype, "amount");
    __decorate([
        (0, mongoose_1.Prop)({ _id: false })
    ], Transfer.prototype, "recipient");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Transfer.prototype, "userWallet");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Transfer.prototype, "user");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Transfer.prototype, "createdAt");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Transfer.prototype, "updatedAt");
    Transfer = __decorate([
        (0, mongoose_1.Schema)({ timestamps: true })
    ], Transfer);
    return Transfer;
}());
exports.Transfer = Transfer;
exports.TransferSchema = mongoose_1.SchemaFactory.createForClass(Transfer);
