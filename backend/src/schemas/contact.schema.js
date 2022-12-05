"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ContactSchema = exports.Contact = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var Contact = /** @class */ (function () {
    function Contact() {
    }
    __decorate([
        (0, mongoose_1.Prop)()
    ], Contact.prototype, "firstName");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Contact.prototype, "lastName");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Contact.prototype, "phoneNumber");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Contact.prototype, "user");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Contact.prototype, "createdAt");
    __decorate([
        (0, mongoose_1.Prop)()
    ], Contact.prototype, "updatedAt");
    Contact = __decorate([
        (0, mongoose_1.Schema)({ timestamps: true })
    ], Contact);
    return Contact;
}());
exports.Contact = Contact;
exports.ContactSchema = mongoose_1.SchemaFactory.createForClass(Contact);
