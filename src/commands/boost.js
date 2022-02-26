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

const boostEmbed = require('../utils/embed/boostEmbed.js');
const mention2id = require('../utils/mention2id.js');

module.exports = {
  name: 'boost',
  alias: ['nitro'],
  admin: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    let member = message.guild.members.cache.get(mention2id(args[0])) || message.member;

    boostEmbed(member, guildInfo, message.channel);

  }
}
