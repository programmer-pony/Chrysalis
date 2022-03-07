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

module.exports = async (client, user, level, channelID, color, lang) => {
	if (!channelID) return;
	let channel = await client.channels.fetch(channelID).catch(r=>{return});
	if (!channel) return;
	if (!channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;
	let embed = new MessageEmbed()
		.setTitle(`${user.username}`)
		.setDescription(lang.levelup.replaceAll('{level}',level))
		.setColor(color)
		.setThumbnail(user.displayAvatarURL());
	channel.send({content: `${user}`, embeds:[embed]}).catch(r=>{});
}
