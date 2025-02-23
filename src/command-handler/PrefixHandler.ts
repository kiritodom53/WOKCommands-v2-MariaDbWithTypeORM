import DCMD from "../../typings";
import { findPrefixes, setPrefix } from "../models/GuildPrefixEntity";

class PrefixHandler {
    // <guildId: prefix>
    private _prefixes = new Map();
    private _defaultPrefix = "!";
    private _instance: DCMD;

    constructor(instance: DCMD) {
        this._instance = instance;

        this.loadPrefixes();
    }

    private async loadPrefixes() {
        if (!this._instance.isConnectedToMariaDB)
            return;


        // const results = await guildPrefixSchema.find({});
        const results = await findPrefixes();

        for (const result of results)
            this._prefixes.set(result.guildId, result.prefix);

    }

    public get defaultPrefix() {
        return this._defaultPrefix;
    }

    public get(guildId?: string) {
        if (!guildId)
            return this.defaultPrefix;


        return this._prefixes.get(guildId) || this.defaultPrefix;
    }

    public async set(guildId: string, prefix: string) {
        if (!this._instance.isConnectedToMariaDB)
            return;


        this._prefixes.set(guildId, prefix);

        await setPrefix(guildId, prefix);
    }
}

export default PrefixHandler;
