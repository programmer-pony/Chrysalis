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

module.exports = async (member, guildInfo, channel) => {
	let lang = require(`../../lang/${guildInfo.lang}.js`);
	let modules = guildInfo.modules;
	let boost = modules.find((c) => c.name == 'boost');
	if (boost.enabled && boost.channel) {
		let embed = new MessageEmbed()
			.setTitle((boost.title !== 'default' ? boost.title : lang.defaultValues.boost.title).replace('{user}',member.user.username))
			.setDescription((boost.description !== 'default' ? boost.description : lang.defaultValues.boost.description).replace('{user}',member.user))
			.setThumbnail(member.user.displayAvatarURL())
			.setColor(member.guild.roles.premiumSubscriberRole?.color || '#db6de2' /* Pink */);
		channel ??= member.client.channels.cache.find(channel => channel.id == boost.channel);
		if (channel) channel.send({content:(boost.message !== 'default' ? boost.message : lang.defaultValues.boost.message).replace('{user}',member.user),embeds:[embed]}).catch(r=>{});
  }
}
