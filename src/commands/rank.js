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

const connectToDatabase = require('../utils/connectToDatabase.js');
const rankCard = require('../utils/canvas/rankCard.js');
const mention2id = require('../utils/mention2id.js');
const { MessageAttachment } = require('discord.js');

module.exports = {
  name: 'rank',
  alias: ['level','r'],
  run: async (client, message, command, args, lang, guildInfo) => {

    taggedUser = mention2id(args[0]) || message.member.user.id;

    try {
      taggedUserObject = await client.users.fetch(taggedUser); // Check if it's a valid user
    	let rank = guildInfo.modules.find((c) => c.name == 'rank');
      let user = rank.users.find(u => u.id == taggedUser);
      if (!user) {
        rank.users.push({id: taggedUser, xp: 0});
        user = rank.users.find(u => u.id == taggedUser);
      }
      let userLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));
      let highscores = rank.users.sort((a, b) => (a.xp < b.xp) ? 1 : -1);

      let db = await connectToDatabase();
      let users = db.db('chrysalis').collection('users');
      let userPrefs = await users.findOne({id:user.id});
      db.close();

      await rankCard(
        taggedUserObject,
        userPrefs?.color || '#4f9068',
        userPrefs?.bgURL,
        highscores.indexOf(user)+1, // rank
        userLevel, // level
        user.xp-(userLevel*userLevel*5), // currentXP
        ((userLevel+1)*(userLevel+1)*5)-(userLevel*userLevel*5), // requiredXP
        user.xp, // totalXP
        message,
        lang
      );

    } catch (e) {
      if (message.author) message.reply(lang.couldn_t_find_that_user);
      else message.editReply(lang.couldn_t_find_that_user);
    }
  }
}
