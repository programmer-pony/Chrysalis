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

module.exports = [
  {
    name: 'logs',
    enabled: false,
    channel: ''
  },
  {
    name: 'bannedwords',
    enabled: true,
    words: []
  },
  {
    name: 'boost',
    enabled: false,
    channel: '',
    message: 'default',
    title: 'default',
    description: 'default'
  },
  {
    name: 'suggestions',
    enabled: false,
    channel: ''
  },
  {
    name: 'help',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'userinfo',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'avatar',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'roleinfo',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'serverinfo',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'love',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'booru',
    enabled: true,
    restricted: false,
    allowedChannels: [],
    filter: 229
  },
  {
    name: 'clop',
    enabled: true,
    restricted: false,
    allowedChannels: [],
    filter: 200
  },
  {
    name: 'e621',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'emoji',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'boop',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'hug',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'kiss',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'welcome',
    enabled: false,
    channel: '',
    background: '',
    message: 'default'
  },
  {
    name: 'goodbye',
    enabled: false,
    channel: '',
    message: 'default',
    banMessage: 'default'
  },
  {
    name: 'torrent',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'rank',
    enabled: false,
    restricted: false,
    allowedChannels: [],
    xpBlacklistChannels: [],
    xpPerMessage: 2,
    messageCooldown: 8,
    xpInVoiceChat: 3,
    voiceChatCooldown: 60,
    announceLevelUp: true,
    announceLevelUpChannel: '',
    users: []
  },
  {
    name: 'profile',
    enabled: true,
    restricted: false,
    allowedChannels: []
  },
  {
    name: 'say',
    enabled: true,
    restricted: false,
    allowedChannels: []
  }
];
