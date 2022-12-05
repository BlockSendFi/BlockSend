"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.ContactService = void 0;
var common_1 = require("@nestjs/common");
var mongoose_1 = require("@nestjs/mongoose");
var contact_schema_1 = require("../schemas/contact.schema");
var ContactService = /** @class */ (function () {
    function ContactService(contactModel) {
        this.contactModel = contactModel;
    }
    ContactService.prototype.createContact = function (contactInput, user) {
        return new this.contactModel(__assign(__assign({}, contactInput), { user: user._id })).save();
    };
    ContactService.prototype.getMyContacts = function (user) {
        return this.contactModel.find({ user: user._id }).lean();
    };
    ContactService.prototype.getContact = function (contactId) {
        return this.contactModel.findById(contactId).lean();
    };
    ContactService = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, mongoose_1.InjectModel)(contact_schema_1.Contact.name))
    ], ContactService);
    return ContactService;
}());
exports.ContactService = ContactService;
