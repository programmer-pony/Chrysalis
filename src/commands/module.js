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
const fetch = require('node-fetch');
const Canvas = require('canvas');
const reloadSlashCommands = require('../utils/reloadSlashCommands.js');
const connectToDatabase = require('../utils/connectToDatabase.js');
const defaultModules = require('../defaultModules.js');
const validModules = defaultModules.map(m => m.name);

module.exports = {
  name: 'module',
  alias: ['modules','editmodule','config','enable','disable','reset'],
  admin: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    // Valid modules embed
    let vmembed = new MessageEmbed().setDescription(validModules.map(m => `[${m}](https://chrysalis-docs.programmerpony.com${guildInfo.lang == 'es' ? '/es/' : '/'}modules/${m}.html)`).join('\n')).setTitle(lang.valid_modules).setColor(guildInfo.color);

    let requestedModule = args[0] ? args[0].toLowerCase() : null;
    if (!requestedModule || validModules.indexOf(requestedModule) == -1) return message.channel.send({embeds:[vmembed]});

    if (command == 'enable' || command == 'disable') return switchModule(message, requestedModule, command == 'enable', guildInfo, lang);
    if (command == 'reset') return resetModule(message, requestedModule, guildInfo, lang);

    let action = args[1];
    if (!action) return message.channel.send({embeds: [await moduleInfo(message, requestedModule, guildInfo, lang)]});

    switch (action) {
      case 'enable':
      case 'disable':
        switchModule(message, requestedModule, action == 'enable', guildInfo, lang);
        break;
      case 'reset':
        resetModule(message, requestedModule, guildInfo, lang);
        break;
      default:
        checkAction(message, requestedModule, action, guildInfo, args, lang);
        break;
    }

  }
}

async function switchModule(message, requestedModule, enable, guildInfo, lang) {
  // Enables or disables a module
  message.channel.send((enable ? lang.module_enabled : lang.module_disabled).replace('{0}', requestedModule));
  let targetModule = guildInfo.modules.find((c) => c.name == requestedModule);
  if (targetModule.enabled == enable) return; // Do not update database if nothing will change
  targetModule.enabled = enable;
  await update(requestedModule, message, guildInfo, lang);
  await reloadSlashCommands(message.client, message.guild, guildInfo);
}

async function moduleInfo(message, requestedModule, guildInfo, lang) {
  let moduleObj = guildInfo.modules.find((c) => c.name == requestedModule);
  let embed = new MessageEmbed()
    .setTitle(requestedModule)
    .setURL(`https://chrysalis-docs.programmerpony.com${guildInfo.lang == 'es' ? '/es/' : '/'}modules/${requestedModule}.html`)
    .setFooter({text:lang.check_documentation})
    .setColor(guildInfo.color);
  for (key of Object.keys(moduleObj)) {
    if (key == 'name' || key == 'users') continue;
    switch (typeof moduleObj[key]) {
      case 'boolean':
        embed.addField(key, moduleObj[key] ? '✅' : '❌')
        break;
      case 'string':
        let content = moduleObj[key];
        if (key.toLowerCase().endsWith('channel') && content) content = `<#${content}>`;
        if (content == 'default') content = lang.defaultValues[requestedModule][key] || content;
        embed.addField(key, content || '...');
        break;
      case 'number':
        embed.addField(key, moduleObj[key].toString());
        break;
      case 'object':
        if (Array.isArray(moduleObj[key])) {
          if (!moduleObj[key].length) embed.addField(key, '[]');
          else if (key.toLowerCase().endsWith('channels')) embed.addField(key, `<#${moduleObj[key].join('>\n<#')}>`);
          else embed.addField(key, moduleObj[key].join('\n'));
        }
        break;
    }
  }
  return embed;
}

async function checkAction(message, requestedModule, targetKey, guildInfo, args, lang) {

  let moduleObj = guildInfo.modules.find((c) => c.name == requestedModule);
  let key = Object.keys(moduleObj).find(i => i == targetKey);
  if (!key || (key == 'name' || key == 'users')) return message.reply(lang.module_property_not_found);
  if (args.length <= 2) return message.reply(lang.please_specify_a_new_value);
  switch (typeof moduleObj[key]) {
    case 'number':
      if (isNaN(parseInt(args[2])) || parseInt(args[2]) >= Number.MAX_SAFE_INTEGER || parseInt(args[2]) < 0) return message.reply(lang.please_type_a_valid_positive_integer);
      if (key == 'filter') {
        try {
          let res = await fetch(`https://manebooru.art/api/v1/json/filters/${moduleObj[key]}`);
          if (!res.json().filter) return message.reply(lang.filter_not_found);
        } catch (e) { return message.reply(lang.filter_not_found); }
      }
      moduleObj[key] = parseInt(args[2]);
      break;
    case 'boolean':
      if (args[2] == 'true' || args[2] == 'false') moduleObj[key] = args[2] == 'true';
      else return message.reply(lang.value_must_be_true_or_false);
      break;
    default:
    if (Array.isArray(moduleObj[key])) {
      args.shift();
      args.shift();
      if (key.toLowerCase().endsWith('channels')) {
        await message.guild.channels.fetch();
        for (let ckey of Object.keys(args)) {
          if (args[ckey].startsWith('<#')) args[ckey] = args[ckey].substring(2,args[ckey].length-1);
          if (!message.guild.channels.cache.get(args[ckey])) return message.reply(lang.invalid_channel);
        }
      }
      moduleObj[key] = args;
    } else {
      moduleObj[key] = args[2];
      if (key.toLowerCase().endsWith('channel')) {
        if (moduleObj[key].startsWith('<#')) moduleObj[key] = moduleObj[key].substring(2,moduleObj[key].length-1);
        await message.guild.channels.fetch();
        if (!message.guild.channels.cache.get(moduleObj[key])) return message.reply(lang.please_type_a_valid_channel);
      }
      if (key.toLowerCase().endsWith('message')) {
        args.shift();
        args.shift();
        moduleObj[key] = args.join(' ');
      }
      if (key == 'background') {
        try {
          await Canvas.loadImage(args[2]);
          moduleObj[key] = args[2];
        } catch (e) {
          return message.reply(lang.unsupported_image_type);
        }
      }
    }
  }
  await update(requestedModule, message, guildInfo, lang);
}

async function update(requestedModule, message, guildInfo, lang) {
  let db = await connectToDatabase();
  let guilds = db.db('chrysalis').collection('guilds');
  await guilds.updateOne({id: message.guild.id},{ $set: { modules: guildInfo.modules}});
  db.close();
  message.channel.send({content: lang.module_updated, embeds: [await moduleInfo(message, requestedModule, guildInfo, lang)]});
}

async function resetModule(message, requestedModule, guildInfo, lang) {
  let i = guildInfo.modules.findIndex((c) => c.name == requestedModule);
  guildInfo.modules[i] = defaultModules.find((c) => c.name == requestedModule);
  await update(requestedModule, message, guildInfo, lang);
  await reloadSlashCommands(message.client, message.guild, guildInfo);
}
