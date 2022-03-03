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
const mention2id = require('../utils/mention2id.js');

module.exports = {
  name: 'userinfo',
  alias: ['user-info','ui','user','memberinfo','member-info','mi','member'],
  run: async (client, message, command, args, lang, guildInfo) => {
    let taggedUser = mention2id(args[0]);
    // If there is no mention, check if the command is replying to another user's message. If not, use command author.
    if (!taggedUser) return message.mentions?.members.first() ? showMemberInfo(client, command, message, message.mentions.members.first(), guildInfo.color, lang) : showMemberInfo(client, command, message, message.member, guildInfo.color, lang);
    asyncMember(client, command, message, taggedUser, guildInfo.color, lang);
  }
}

async function asyncMember(client, command, message, taggedUser, color, lang) {
  try {
    taggedUser = await message.guild.members.fetch(taggedUser);
    showMemberInfo(client, command, message, taggedUser, color, lang);
  } catch (e) {
    try {
      taggedUser = await client.users.fetch(taggedUser);
      showUserInfo(client, command, message, taggedUser, color, lang);
    } catch (e) {
      return message.reply(lang.couldn_t_find_that_user);
    }
  }
}

function showMemberInfo(client, command, message, member, color, lang) {
  let joined = Math.trunc(member.joinedTimestamp / 1000);
  let created = Math.trunc(member.user.createdTimestamp / 1000);
  let embed = new MessageEmbed()
    .setDescription(`__**${lang.user_info}**__`)
    .setColor(color)
    .setThumbnail(member.user.displayAvatarURL({size:1024}))
    .addField(lang.name, member.user.tag)
    .addField(lang.user_id, member.id)
    .addField(lang.server_join_date, `<t:${joined}:F> (<t:${joined}:R>)`)
    .addField(lang.account_creation_date, `<t:${created}:F> (<t:${created}:R>)`)
    .addField(lang.roles, member.roles.cache.map(roles => `${roles}`).join(' '), true)
  return message.author ? message.channel.send({embeds:[embed]}) : message.editReply({embeds:[embed]});
}

function showUserInfo(client, command, message, taggedUser, color, lang) {
  let created = Math.trunc(taggedUser.createdTimestamp / 1000);
  let embed = new MessageEmbed()
    .setDescription(`__**${lang.user_info}**__`)
    .setColor(color)
    .setThumbnail(taggedUser.displayAvatarURL({size:1024}))
    .addField(lang.name, `${taggedUser.username}#${taggedUser.discriminator}`)
    .addField(lang.user_id, taggedUser.id)
    .addField(lang.account_creation_date, `<t:${created}:F> (<t:${created}:R>)`);
  return message.author ? message.channel.send({embeds:[embed]}) : message.editReply({embeds:[embed]});
}
