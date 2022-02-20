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

const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
  name: 'rolemenu',
  alias: ['role-menu'],
  admin: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    if (!message.guild.me.permissions.has('MANAGE_ROLES')) return message.reply(lang.manage_roles_permission_required);

    let helpEmbed = new MessageEmbed()
      .setTitle(lang.usage)
      .setDescription(`${guildInfo.prefix}rolemenu roleID roleID roleID...`)
      .setColor(guildInfo.color)

    args = [...new Set(args)];
    let roles = [];

    for (role in args) try {
      roles.push(message.guild.roles.cache.get(args[role]).id);
    } catch (e) { /* Skip invalid role */ }

    if (roles.length == 0) return message.channel.send({embeds:[helpEmbed]});
    if (roles.length > 25) return message.reply(lang.you_can_only_add_up_to_25_roles_to_the_menu);

    let embed = new MessageEmbed()
      .setTitle(lang.role_menu)
      .setDescription(lang.select_the_roles_that_you_want)
      .setColor(guildInfo.color)

    let rows = []
    rows[0] = roles.slice(0,5)
    rows[1] = roles.slice(5,10)
    rows[2] = roles.slice(10,15)
    rows[3] = roles.slice(15,20)
    rows[4] = roles.slice(20,25)

    let buttonRow = [];

    for (let [index, row] of rows.entries()) {
      if (row.length == 0) break;
      buttonRow[index] = new MessageActionRow()
      for (role of row) {
        await message.guild.roles.fetch();
        if (!message.guild.roles.cache.get(role)) break;
        let button = new MessageButton()
          .setStyle('PRIMARY')
          .setLabel(message.guild.roles.cache.get(role).name)
          .setCustomId(`role-${role}`);
        buttonRow[index].addComponents(button);
      }
    }

    message.channel.send({embeds: [embed], components : buttonRow });

  }
}
