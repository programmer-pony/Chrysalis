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
  name: 'emoji',
  alias: ['jumbo'],
  run: async (client, message, command, args, lang, guildInfo) => {

    for (guild of client.guilds.cache.values()) await guild.emojis.fetch();
    let emoji = (args[0]?.split(':')[2]) ? client.emojis.resolve(args[0].split(':')[2].replace('>','')) : client.emojis.cache.find((e) => e.name === args[0]?.split(':')[1]);
    if (!emoji) return message.author ? message.reply({content:lang.couldn_t_find_that_emoji}) : message.editReply({content:lang.couldn_t_find_that_emoji});

    let embed = new MessageEmbed()
      .setTitle(lang.download_emoji)
      .setURL(emoji.url)
      .setImage(emoji.url)
      .setColor(guildInfo.color);
    if (message.author) message.channel.send({embeds:[embed]});
    else message.editReply({embeds:[embed]});

  }
}
