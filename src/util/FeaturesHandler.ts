import { Client } from "discord.js";
import DCMD from "../../typings";
import getAllFiles from "./get-all-files";

class FeaturesHandler {
    constructor(instance: DCMD, featuresDir: string, client: Client) {
        this.readFiles(instance, featuresDir, client);
    }

    private async readFiles(
        instance: DCMD,
        featuresDir: string,
        client: Client,
    ) {
        const files = getAllFiles(featuresDir);

        for (const file of files) {
            let func = require(file.filePath);
            func = func.default || func;

            if (func instanceof Function)
                await func(instance, client);

        }
    }
}

export default FeaturesHandler;
