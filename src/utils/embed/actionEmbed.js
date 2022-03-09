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
const mention2id = require('../mention2id.js');

module.exports = async (message, color, args, action) => {

  let taggedUser = mention2id(args[0]) || message.mentions.users.first() || message.member.id;

  let author = message.member.nickname || message.member.user.username;
  let onSelf = false;
  let onChrysalis = false;

  try {
    targetUser = await message.guild.members.fetch(taggedUser);
    color = targetUser.displayHexColor == '#000000' ? color : targetUser.displayHexColor;
    if (targetUser.id == message.client.user.id) onChrysalis = true;
    if (targetUser.id == message.member.id) onSelf = true;
    targetUser = targetUser.nickname || targetUser.user.username;
  } catch (e) {
    targetUser = args.join(' ');
  }

  if (targetUser == '@everyone' || targetUser == '@here' || targetUser == '@everypony') targetUser = 'everypony';

  let embed = new MessageEmbed().setColor(color);

  if (onSelf) embed
    .setTitle(action.onSelf.text.replace(`{0}`,author))
    .setImage(pickRandomElement(action.onSelf.gifs));
  else
  if (onChrysalis && action.onChrysalis) embed
    .setTitle(action.onChrysalis.text.replace(`{0}`,author))
    .setImage(pickRandomElement(action.onChrysalis.gifs));
  else
  if (targetUser == 'everypony' && action.onEverypony) embed
    .setTitle(action.onEverypony.text.replace(`{0}`,author))
    .setImage(pickRandomElement(action.onEverypony.gifs));
  else embed
    .setTitle(action.text.replace('{0}',author).replace('{1}',targetUser))
    .setImage(pickRandomElement(action.gifs));

  return message.author ? message.channel.send({embeds:[embed]}) : message.editReply({embeds:[embed]});

}

function pickRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
