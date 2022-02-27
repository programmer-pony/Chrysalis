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

module.exports = async (user, color, bgURL, rank, level, currentXP, requiredXP, totalXP, message, lang) => {

  switch (rank) {
    case 1:
      rank = '🥇';
      break;
    case 2:
      rank = '🥈';
      break;
    case 3:
      rank = '🥉';
      break;
    default:
      rank = `#${rank}`
  }

  // Create canvas
  let canvas = Canvas.createCanvas(934,282);
  let ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#23272a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#333640';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.globalAlpha = 1;
  if (bgURL) try {
    let bg = await Canvas.loadImage(bgURL);
    ctx.drawImage(bg, 10, 10, canvas.width - 20, canvas.height - 20);
    ctx.shadowColor = 'rgba(0,0,0,1)';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 10;
  } catch (e) {/* Image URL is invalid */}

  // Text
  Canvas.registerFont('./src/fonts/Montserrat-Black.ttf',{ family: 'Montserrat', weight: 'Black' });
  Canvas.registerFont('./src/fonts/Montserrat-Medium.ttf',{ family: 'Montserrat', weight: 'Medium' });
  ctx.font = '42px Montserrat Black';
  ctx.textAlign = 'left';
	ctx.fillStyle = 'white';
  // Username
  let usrtxt = user.username.length > 16 ? user.username.slice(0,14)+'...' : user.username;
  let discriminatorX = canvas.width/2-200 + ctx.measureText(usrtxt).width;
  await fillTextWithTwemoji(ctx, `${usrtxt}`, canvas.width/2-200, canvas.height/2);
  ctx.font = '36px Montserrat Medium';
  ctx.globalAlpha = 0.5;
  ctx.fillText(`#${user.discriminator}`, discriminatorX, canvas.height/2)
  ctx.globalAlpha = 1;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'white';
  // Rank and level
  ctx.fillText(`${lang.level.toUpperCase()} ${level}`, canvas.width-50, 75);
  await fillTextWithTwemoji(ctx, `${lang.rank.toUpperCase()} ${rank}`, canvas.width-ctx.measureText(`${lang.level.toUpperCase()} ${level}`).width-75, 75);
  ctx.font = '28px Montserrat Medium';
  // Current and required XP
  ctx.fillText(`${currentXP}/${requiredXP}`, canvas.width-50, canvas.height/2);
  ctx.font = '24px Montserrat Medium';
  ctx.fillText(`${lang.total_xp.toUpperCase()}: ${totalXP}`, canvas.width-50, canvas.height/2+85);

  // Progress bar
  const lineX = 260;
  const lineY = 155;
  const lineHeight = 38;
  const lineWidth = 620;
  const r = lineHeight / 2; // Arc radius
  let canvas2 = Canvas.createCanvas(934,282); // Create another canvas so that the elements merge before applying the transparency
  let ctx2 = canvas2.getContext('2d');
  ctx2.fillStyle = '#151515';
  ctx2.arc(lineX + r, lineY + r, r, 1.5 * Math.PI, 0.5 * Math.PI, true);
  ctx2.fill();
  ctx2.fillRect(lineX + r, lineY, lineWidth - r, lineHeight);
  ctx2.arc(lineX + lineWidth, lineY + r, r, 1.5 * Math.PI, 0.5 * Math.PI);
  ctx2.fill();
  ctx2.beginPath();
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.75;
  ctx.drawImage(canvas2,0,0,canvas.width,canvas.height);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.arc(lineX + r, lineY + r, r, 1.5 * Math.PI, 0.5 * Math.PI, true);
  ctx.fill();
  let progress = getProgress(currentXP, requiredXP, lineWidth, r);
  ctx.fillRect(lineX + r, lineY, progress, lineHeight);
  ctx.arc(lineX + r + progress, lineY + r, r, 1.5 * Math.PI, 0.5 * Math.PI);
  ctx.fill();

  // Profile picture
  const radius = 100;
  const x = 135;
  ctx.beginPath();
  ctx.arc(x, canvas.height/2, radius, 0, Math.PI * 2, true);
  ctx.strokeStyle = color;
  ctx.lineWidth = '15';
  ctx.stroke();
  ctx.closePath();
  ctx.clip();
  let avatar = user.displayAvatarURL({format: 'png', size:1024});
  try {
    pfp = await Canvas.loadImage(avatar);
    ctx.drawImage(pfp, x-radius, canvas.height/2-radius, radius*2, radius*2);
  } catch (e) {
    /* Thank you Discord API for being trash */
  }

  // Send the image
  let attachment = new MessageAttachment(canvas.toBuffer(), 'rank.png');
  if (message.author) message.channel.send({files: [attachment]});
  else message.editReply({files: [attachment]});

}

function getProgress(currentXP, requiredXP, lineWidth, r) {
  const maxWidth = lineWidth - r;
  let width = (currentXP * lineWidth) / requiredXP;
  if (currentXP > requiredXP || width > maxWidth) return maxWidth;
  return width;
}
