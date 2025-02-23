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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPrefixes = exports.setPrefix = exports.isPrefixExist = exports.GuildPrefixEntity = void 0;
const typeorm_1 = require("typeorm");
const DCMD_1 = require("../DCMD");
let GuildPrefixEntity = class GuildPrefixEntity {
    guildId;
    prefix;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GuildPrefixEntity.prototype, "guildId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GuildPrefixEntity.prototype, "prefix", void 0);
GuildPrefixEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "guild_prefix", })
], GuildPrefixEntity);
exports.GuildPrefixEntity = GuildPrefixEntity;
const isPrefixExist = async (ds, guildId, prefix) => {
    const repo = await ds.getRepository(GuildPrefixEntity);
    const result = await repo.findOneBy({ guildId: guildId, });
    return result;
};
exports.isPrefixExist = isPrefixExist;
const setPrefix = async (guildId, prefix) => {
    const repo = await DCMD_1.ds.getRepository(GuildPrefixEntity);
    if (await (0, exports.isPrefixExist)(DCMD_1.ds, guildId, prefix)) {
        await repo.update({ guildId: guildId, }, { prefix: prefix, });
        return true;
    }
    await repo.insert({
        guildId,
        prefix,
    });
    return true;
};
exports.setPrefix = setPrefix;
const findPrefixes = async () => {
    const repo = await DCMD_1.ds.getRepository(GuildPrefixEntity);
    const result = await repo.find();
    return !result ? [] : result;
};
exports.findPrefixes = findPrefixes;
