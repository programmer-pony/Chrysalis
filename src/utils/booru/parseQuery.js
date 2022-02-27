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

module.exports = async (message, args) => {
  let query = '';
  if (args.length>0) query = message.author ? args.join(' ') : args[0];
  while (query.includes(' ,')) query = query.replace(' ,',',');
  while (query.includes(', ')) query = query.replace(', ',',');
  while (query.includes(',,')) query = query.replace(',,',',');
  if (query.startsWith(',')) query = query.slice(1);
  if (query.endsWith(',')) query = query.slice(0,-1);
  return query;
}
