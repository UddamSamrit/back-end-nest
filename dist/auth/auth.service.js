"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async signup(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new this.userModel({ username, password: hashedPassword });
        await newUser.save();
        return this.generateToken(newUser);
    }
    getJwtToken(userId, secret, expiresIn) {
        return this.jwtService.sign({ userId }, { secret, expiresIn });
    }
    async refresh(refresh_token) {
        const payload = this.jwtService.verify(refresh_token, {
            secret: process.env.REFRESH_SECRET,
        });
        const newAccessToken = this.getJwtToken(payload.userId, process.env.JWT_SECRET, process.env.JWT_EXPIRATION_TIME);
        return {
            newAccessToken,
        };
    }
    async login(username, password) {
        const user = await this.userModel.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const accessToken = this.getJwtToken(user._id.toString(), process.env.JWT_SECRET, process.env.JWT_EXPIRATION_TIME);
        const refreshToken = this.getJwtToken(user._id.toString(), process.env.REFRESH_SECRET, process.env.REFRESH_EXPIRATION_TIME);
        return {
            accessToken,
            refreshToken,
            user,
        };
    }
    generateToken(user) {
        const payload = { username: user.username, sub: user.id };
        return { access_token: this.jwtService.sign(payload), user };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map