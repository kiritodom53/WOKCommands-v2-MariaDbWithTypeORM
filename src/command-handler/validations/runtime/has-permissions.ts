import { PermissionFlagsBits } from "discord.js";

import Command from "../../Command";
import { CommandUsage } from "../../../../typings";
import { RequiredPermissionsEntity } from "../../../models/RequiredPermissionsEntity";
import { ds } from "../../../DCMD";

const keys = Object.keys(PermissionFlagsBits);

export default async (command: Command, usage: CommandUsage) => {
    const { permissions = [], } = command.commandObject;
    const { instance, guild, member, message, interaction, } = usage;

    if (!member || !instance.isConnectedToMariaDB)
        return true;


    const repo = await ds.getRepository(RequiredPermissionsEntity);

    const document = await repo.findBy({
        guildId: guild!.id,
        cmdId: command.commandName,
    });

    if (document.length > 0)
        for (const permission of document)
            if (
                !permissions.includes(
                    permission.permission as unknown as bigint,
                )
            )
                permissions.push(permission.permission as unknown as bigint);


    if (permissions.length) {
        const missingPermissions = [];

        for (const permission of permissions)
            // @ts-ignore
            if (!member.permissions.has(permission)) {
                const permissionName = keys.find(
                    // @ts-ignore
                    // prettier-ignore
                    (key) => key === permission || PermissionFlagsBits[key] === permission,
                );
                missingPermissions.push(permissionName);
            }


        if (missingPermissions.length) {
            const text = `You are missing the following permissions: "${ missingPermissions.join(
                "\", \"",
            ) }"`;

            if (message) message.reply(text);
            else if (interaction) interaction.reply(text);

            return false;
        }
    }

    return true;
};
