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

const fetchImage = require('../utils/booru/fetchImage.js');
const parseQuery = require('../utils/booru/parseQuery.js');

module.exports = {
  name: 'clop',
  alias: ['boorunsfw','explicit'],
  nsfw: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    let query = await parseQuery(message, args);
    let filter = guildInfo.modules.find((c) => c.name == 'clop').filter;

    /* Some tags are hidden by default but they will be
    shown anyways if you explicitly search for them.
    For more customization, use your own filter. */
    const f = ['grimdark','semi-grimdark','grotesque','gore','vore','inflation','fat fetish','fattening','force feeding','fart','fart fetish','scat','diaper','screencap','hyper muscle','hyper lactation','hyper'];
    if (query) {
      if (filter == 200) for (i of f) if (!query.includes(i)) query += `,-${i}`;
      query = `${query.includes('id:') || `,${query}`.includes(',suggestive') ? '(questionable || explicit || suggestive)' : '(questionable || explicit)'},${query}&filter_id=${filter}&per_page=50`;
    } else {
      query = `(questionable || explicit), -${f.join(',-')}&filter_id=${filter}&per_page=50`;
    }
    fetchImage(client, query, message, guildInfo.color, 1, lang);
  }
}
