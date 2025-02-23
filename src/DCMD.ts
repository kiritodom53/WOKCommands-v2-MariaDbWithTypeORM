import { Client } from "discord.js";

import CommandHandler from "./command-handler/CommandHandler";
import EventHandler from "./event-handler/EventHandler";
import DCMD, { Events, Options, Validations } from "../typings";
import Cooldowns from "./util/Cooldowns";
import DefaultCommands from "./util/DefaultCommands";
import FeaturesHandler from "./util/FeaturesHandler";
import { DataSource } from "typeorm";
import indexModel from "./models/index-model";

export let ds: DataSource;

class DssbCmdler {
    private _client!: Client;
    private _testServers!: string[];
    private _botOwners!: string[];
    private _cooldowns: Cooldowns | undefined;
    private _disabledDefaultCommands!: DefaultCommands[];
    private _validations!: Validations;
    private _commandHandler: CommandHandler | undefined;
    private _eventHandler!: EventHandler;
    private _isConnectedToMariaDB = false;

    constructor(options: Options) {
        process.env.TZ = "Europe/Prague";
        this.init(options);
    }

    private async init(options: Options) {
        const {
            client,
            commandsDir,
            featuresDir,
            testServers = [],
            botOwners = [],
            cooldownConfig,
            disabledDefaultCommands = [],
            events = {},
            validations = {},
        } = options;

        if (!client)
            throw new Error("A client is required.");


        await this.connectToMariaDb();

        // Add the bot owner's ID
        if (botOwners.length === 0) {
            await client.application?.fetch();
            const ownerId = client.application?.owner?.id;
            if (ownerId && botOwners.indexOf(ownerId) === -1)
                botOwners.push(ownerId);

        }

        this._client = client;
        this._testServers = testServers;
        this._botOwners = botOwners;
        this._disabledDefaultCommands = disabledDefaultCommands;
        this._validations = validations;
        // this._dataSource = dataSource!

        this._cooldowns = new Cooldowns(this as unknown as DCMD, {
            errorMessage: "Please wait {TIME} before doing that again.",
            botOwnersBypass: false,
            dbRequired: 300, // 5 minutes
            ...cooldownConfig,
        });

        if (commandsDir)
            this._commandHandler = new CommandHandler(
                this as unknown as DCMD,
                commandsDir,
                client,
            );


        if (featuresDir)
            new FeaturesHandler(this as unknown as DCMD, featuresDir, client);


        this._eventHandler = new EventHandler(
            this as unknown as DCMD,
            events as Events,
            client,
        );
    }

    public get client(): Client {
        return this._client;
    }

    public get testServers(): string[] {
        return this._testServers;
    }

    public get botOwners(): string[] {
        return this._botOwners;
    }

    public get cooldowns(): Cooldowns | undefined {
        return this._cooldowns;
    }

    public get disabledDefaultCommands(): DefaultCommands[] {
        return this._disabledDefaultCommands;
    }

    public get commandHandler(): CommandHandler | undefined {
        return this._commandHandler;
    }

    public get eventHandler(): EventHandler {
        return this._eventHandler;
    }

    public get validations(): Validations {
        return this._validations;
    }

    public get isConnectedToMariaDB(): boolean {
        return this._isConnectedToMariaDB;
    }

    private async connectToMariaDb() {
        ds = new DataSource({
            type: "mariadb",
            host: process.env.MARIADB_HOST,
            port: Number(process.env.MARIADB_PORT),
            username: process.env.MARIADB_USERNAME,
            password: process.env.MARIADB_PASSWORD,
            database:
                process.env.LIVE == "true"
                    ? process.env.MARIADB_DATABASE
                    : process.env.MARIADB_DATABASE_TEST,
            synchronize: false, // Není potřeba synchronizovat, pouze se dotážeme na konkrétní tabulky
            entities: indexModel,
        });

        await ds.initialize();
        console.log("ds.init complete");
        console.log(
            process.env.LIVE == "true"
                ? process.env.MARIADB_DATABASE
                : process.env.MARIADB_DATABASE_TEST,
        );

        this._isConnectedToMariaDB = true;
    }
}

export default DssbCmdler;
