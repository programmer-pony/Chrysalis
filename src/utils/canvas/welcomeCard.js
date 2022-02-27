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

const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji-and-discord-emoji');

module.exports = async (lang, bgURL, channel, user, message) => {
	// Create canvas
	let canvas = Canvas.createCanvas(960,540);
	let ctx = canvas.getContext('2d');

	// Set background image (if any)
	if (bgURL) {
		try {
			let bg = await Canvas.loadImage(bgURL);
			ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		} catch (e) {/* Image URL is invalid */}
	}

	// Text
	Canvas.registerFont('./src/fonts/Montserrat-Black.ttf',{ family: 'Montserrat', weight: 'Black' });
	ctx.font = '96px Montserrat Black';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'white';
	ctx.shadowColor = 'rgba(0,0,0,1)';
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 2;
	ctx.shadowBlur = 10;
	// Welcome
	ctx.fillText(lang.welcome.toUpperCase(), canvas.width/2, canvas.height/2+136);
	ctx.font = '48px Montserrat Black';
	// Username
	await fillTextWithTwemoji(ctx, `${user.username.length > 21 ? user.username.toUpperCase().slice(0,18)+'...' : user.username.toUpperCase()}#${user.discriminator}`, canvas.width/2, canvas.height/2+182);
	ctx.font = '36px Montserrat Black';
	// Member count
	ctx.fillText(lang.you_are_the_member_n.toUpperCase().replace('{0}',channel.guild.memberCount), canvas.width/2, canvas.height/2+220);

	// Profile picture
	const radius = 128;
	ctx.beginPath();
	ctx.arc(canvas.width/2, canvas.height/2-80, radius, 0, Math.PI * 2, true);
	ctx.strokeStyle = 'white';
	ctx.lineWidth = '15';
	ctx.stroke();
	ctx.closePath();
	ctx.clip();
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.shadowBlur = 0;
	let avatar = user.displayAvatarURL({format: 'png', size:1024});
	try {
		pfp = await Canvas.loadImage(avatar);
		ctx.drawImage(pfp, canvas.width/2-radius, canvas.height/2-radius-80, radius*2, radius*2);
	} catch (e) {
		/* Thank you Discord API for being trash */
	}

	// Send the image
	let attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.png');
	if (message == '...' || message == 'off' || message.trim() == '' || message == 'none' || message == 'null' || message == 'false') {
		channel.send({files: [attachment]});
	} else {
		if (message == 'default') message = lang.defaultValues.welcome.message;
		channel.send({content: message.replaceAll('{user}',user).replaceAll('{guild}',channel.guild.name), files: [attachment]});
	}
}
