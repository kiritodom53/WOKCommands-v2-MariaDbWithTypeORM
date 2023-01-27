import disabledCommandSchema from "../models/disabled-commands-schema";
import WOK from "../../typings";
import {DisabledCommandsTypeorm, findDisabledCommand} from "../models/disabled-commands-typeorm";
import {ds} from "../WOK";

class DisabledCommands {
  // array of `${guildId}-${commandName}`
  private _disabledCommands: string[] = [];
  private _instance: WOK;

  constructor(instance: WOK) {
    this._instance = instance;

    this.loadDisabledCommands();
  }

  async loadDisabledCommands() {
    if (!this._instance.isConnectedToMariaDB) {
      return;
    }

    const results = await findDisabledCommand()
    // const results = await disabledCommandSchema.find({});

    for (const result of results) {
      this._disabledCommands.push(`${result.guildId}-${result.cmdName}`);
    }
  }

  async disable(guildId: string, commandName: string) {
    if (
      !this._instance.isConnectedToMariaDB ||
      this.isDisabled(guildId, commandName)
    ) {
      return;
    }

    const _id = `${guildId}-${commandName}`;
    this._disabledCommands.push(_id);
    // const ds = this._instance.dataSource;
    const repo = await ds.getRepository(DisabledCommandsTypeorm);

    try {
      // await new disabledCommandSchema({
      //   _id,
      // }).save();
      await repo.save({
        guildId: guildId,
        cmdName: commandName
      })
    } catch (ignored) {}
  }

  async enable(guildId: string, commandName: string) {
    if (
      !this._instance.isConnectedToMariaDB ||
      !this.isDisabled(guildId, commandName)
    ) {
      return;
    }

    const _id = `${guildId}-${commandName}`;
    this._disabledCommands = this._disabledCommands.filter((id) => id !== _id);

    // await disabledCommandSchema.deleteOne({ _id });
    // const ds = this._instance.dataSource;
    const repo = await ds.getRepository(DisabledCommandsTypeorm);
    await repo.delete({
      guildId: guildId,
      cmdName: commandName
    })
  }

  isDisabled(guildId: string, commandName: string) {
    return this._disabledCommands.includes(`${guildId}-${commandName}`);
  }
}

export default DisabledCommands;
