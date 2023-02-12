import { Entity, PrimaryColumn } from "typeorm";
import { ds } from "../DCMD";

@Entity({ name: "disabled_command" })
export class DisabledCommandsTypeorm {
    @PrimaryColumn()
    guildId: string;
    @PrimaryColumn()
    cmdName: string;
}

export const findDisabledCommand = async (): Promise<
    DisabledCommandsTypeorm[]
> => {
    const repo = await ds.getRepository(DisabledCommandsTypeorm);
    const result = await repo.find();
    return !result ? [] : result;
};
