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
const reloadSlashCommands = require('../utils/reloadSlashCommands.js');
const connectToDatabase = require('../utils/connectToDatabase.js');
const path = require('path');
const fs = require('fs');
const langs = [];
const validLangs = fs.readdirSync(path.resolve(__dirname, '../lang/')).filter((f) => f.endsWith('.js')).map(f => f.slice(0,f.indexOf('.js')));

module.exports = {
  name: 'lang',
  alias: ['setlang','language','setlanguage'],
  admin: true,
  validLangs: validLangs,
  run: (client, message, command, args, lang, guildInfo) => {
    if (validLangs.indexOf(args[0])>-1) return changeLang(client, message, args[0]);
    for (l of validLangs) langs.push(`${l} (${require(`../lang/${l}.js`).meta.name})`);
    let embed = new MessageEmbed()
      .setTitle(lang.available_languages)
      .setColor(guildInfo.color)
      .setDescription(langs.join('\n'));
    return message.author ? message.channel.send({embeds:[embed]}): message.editReply({embeds:[embed]});
  }
}

async function changeLang(client, message, newLang) {
  let guildID = message.guild.id;
  let db = await connectToDatabase();
  let guilds = db.db('chrysalis').collection('guilds');
  let guild = await guilds.findOne({id: guildID});
  await guilds.updateOne({id: guildID},{ $set: { lang: newLang}});
  db.close();
  guild.lang = newLang;
  reloadSlashCommands(client, message.guild, guild);
  message.channel.send(require(`../lang/${newLang}.js`).meta.new_lang_message);
}
