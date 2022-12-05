"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.TransferService = void 0;
var common_1 = require("@nestjs/common");
var mongoose_1 = require("@nestjs/mongoose");
var transfer_schema_1 = require("../schemas/transfer.schema");
var _ = require("underscore");
var transfer_status_enum_1 = require("../enums/transfer-status.enum");
var axios_1 = require("axios");
var ethers_1 = require("ethers");
var schedule_1 = require("@nestjs/schedule");
var utils_1 = require("ethers/lib/utils");
var ERC20ABI = require("../contracts/ERC20.json");
var TransferService = /** @class */ (function () {
    function TransferService(transferModel, contactService) {
        this.transferModel = transferModel;
        this.contactService = contactService;
        this.logger = new utils_1.Logger(TransferService_1.name);
    }
    TransferService_1 = TransferService;
    TransferService.prototype.initTransfer = function (initTransferInput, user) {
        return __awaiter(this, void 0, void 0, function () {
            var contact;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contactService.getContact(initTransferInput.contact)];
                    case 1:
                        contact = _a.sent();
                        if (!contact.user.equals(user._id)) {
                            throw new common_1.UnauthorizedException('Contact does not belong to user');
                        }
                        return [2 /*return*/, new this.transferModel({
                            user: user._id,
                            amount: initTransferInput.amount,
                            recipient: _.pick(contact, 'firstName', 'lastName', 'phoneNumber')
                        }).save()];
                }
            });
        });
    };
    TransferService.prototype.getMyTransfers = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.transferModel.find({ user: user._id }).lean()];
            });
        });
    };
    TransferService.prototype.transferDone = function (transferId) {
        return __awaiter(this, void 0, void 0, function () {
            var transfer, hub2Params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.transferModel.findById(transferId)];
                    case 1:
                        transfer = _a.sent();
                        if (transfer.status === transfer_status_enum_1.TransferStatus.DONE) {
                            return [2 /*return*/];
                        }
                        hub2Params = {
                            transferTx: '0x0000000000000000000000000000000000000000000000000000000000000000',
                            amount: 200,
                            account: {
                                firstName: 'John',
                                lastName: 'Doe',
                                phoneNumber: '+123456789'
                            },
                            recipient: transfer.recipient
                        };
                        return [4 /*yield*/, axios_1["default"].post(process.env.HUB2_URL, hub2Params, {
                            headers: {
                                Authorization: "Bearer ".concat(process.env.HUB2_TOKEN)
                            }
                        })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.transferModel.findByIdAndUpdate(transferId, {
                            $set: { status: transfer_status_enum_1.TransferStatus.DONE }
                        })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.transferModel.findById(transferId)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TransferService.prototype.checkPendingTransfers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var networkUrl, provider, signer, EUReContract, pendingTransfers, _i, pendingTransfers_1, transfer, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.info('[CRON] Checking pending transfers');
                        networkUrl = "".concat(process.env.INFURA_NETWORK_ENDPOINT).concat(process.env.INFURA_API_KEY);
                        provider = new ethers_1.ethers.providers.JsonRpcProvider(networkUrl);
                        signer = new ethers_1.ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, provider);
                        EUReContract = new ethers_1.ethers.Contract(process.env.MONERIUM_EURE_ADDRESS, ERC20ABI, provider);
                        console.log('signer:', signer.address);
                        return [4 /*yield*/, this.transferModel
                            .find({ status: transfer_status_enum_1.TransferStatus.INITIALIZED })
                            .lean()];
                    case 1:
                        pendingTransfers = _a.sent();
                        _i = 0, pendingTransfers_1 = pendingTransfers;
                        _a.label = 2;
                    case 2:
                        if (!(_i < pendingTransfers_1.length)) return [3 /*break*/, 5];
                        transfer = pendingTransfers_1[_i];
                        return [4 /*yield*/, EUReContract.balanceOf('0x876476aF52Bd7C2184fFf2dE4543356E4Baa56cA')];
                    case 3:
                        balance = _a.sent();
                        console.log('🚀 ~ file: transfer.service.ts:101 ~ TransferService ~ checkPendingTransfers ~ balance', balance);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    var TransferService_1;
    __decorate([
        (0, schedule_1.Cron)('* * * * *')
    ], TransferService.prototype, "checkPendingTransfers");
    TransferService = TransferService_1 = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, mongoose_1.InjectModel)(transfer_schema_1.Transfer.name)),
        __param(1, (0, common_1.Inject)('ContactService'))
    ], TransferService);
    return TransferService;
}());
exports.TransferService = TransferService;
