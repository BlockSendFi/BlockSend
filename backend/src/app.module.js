"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var mongoose_1 = require("@nestjs/mongoose");
var contact_controller_1 = require("./controllers/contact.controller");
var contact_service_1 = require("./services/contact.service");
var config_1 = require("@nestjs/config");
var contact_schema_1 = require("./schemas/contact.schema");
var transfer_schema_1 = require("./schemas/transfer.schema");
var user_schema_1 = require("./schemas/user.schema");
var passport_1 = require("@nestjs/passport");
var jwt_1 = require("@nestjs/jwt");
var auth_controller_1 = require("./controllers/auth.controller");
var user_service_1 = require("./services/user.service");
var auth_service_1 = require("./services/auth.service");
var jwt_strategy_1 = require("./auth/jwt.strategy");
var local_strategy_1 = require("./auth/local.strategy");
var transfer_controller_1 = require("./controllers/transfer.controller");
var transfer_service_1 = require("./services/transfer.service");
var schedule_1 = require("@nestjs/schedule");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        (0, common_1.Module)({
            imports: [
                schedule_1.ScheduleModule.forRoot(),
                passport_1.PassportModule,
                config_1.ConfigModule.forRoot({
                    envFilePath: ['.env'],
                    isGlobal: true
                }),
                jwt_1.JwtModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: function (configService) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, {
                                    secret: configService.get('JWT_SECRET'),
                                    signOptions: { expiresIn: '3600s' }
                                }];
                        });
                    }); },
                    inject: [config_1.ConfigService]
                }),
                mongoose_1.MongooseModule.forFeature([
                    { name: contact_schema_1.Contact.name, schema: contact_schema_1.ContactSchema },
                    { name: transfer_schema_1.Transfer.name, schema: transfer_schema_1.TransferSchema },
                    { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                ]),
                mongoose_1.MongooseModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: function (configService) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, {
                                    uri: configService.get('MONGO_URI'),
                                    useNewUrlParser: true,
                                    useUnifiedTopology: true
                                }];
                        });
                    }); },
                    inject: [config_1.ConfigService]
                }),
            ],
            controllers: [contact_controller_1.ContactController, auth_controller_1.AuthController, transfer_controller_1.TransferController],
            providers: [
                contact_service_1.ContactService,
                user_service_1.UserService,
                transfer_service_1.TransferService,
                auth_service_1.AuthService,
                jwt_strategy_1.JwtStrategy,
                local_strategy_1.LocalStrategy,
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
