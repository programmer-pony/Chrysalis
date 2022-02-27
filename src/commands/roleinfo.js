/*

 Copyright (C) 2022 programmerpony

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'roleinfo',
  alias: ['role-info','ri'],
  run: async (client, message, command, args, lang, guildInfo) => {

    if (!args[0]) return message.reply(lang.unkown_role);

    await message.guild.members.fetch();
    await message.guild.roles.fetch();

    let requestedRole = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(args.join(' ').toLowerCase()));
    requestedRole ??= message.guild.roles.cache.find(role => role.id == args[0]);
    requestedRole ??= message.guild.roles.cache.find(role => role.id == args[0].slice(3,-1));

    if (!requestedRole) return message.reply(lang.unkown_role);

    let created = Math.trunc(requestedRole.createdTimestamp / 1000);
    let embed = new MessageEmbed()
      .setDescription(`__**${lang.role_info}**__`)
      .setColor(requestedRole.hexColor)
      .addField(lang.name, `${requestedRole}`)
      .addField(lang.role_id, `${requestedRole.id}`)
      .addField(lang.color, requestedRole.hexColor)
      .addField(lang.member_count, requestedRole.members.size.toString())
      .addField(lang.date_created, `<t:${created}:F> (<t:${created}:R>)`);

    if (message.author) message.channel.send({embeds:[embed]});
    else message.editReply({embeds:[embed]});

  }
}
