const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var lang;
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;
const defaultModules = require('../defaultModules.json').modules;
const reloadSlashCommands = require('../utils/reloadSlashCommands.js');

const validModules = defaultModules.map(m => m.name);
vmembed = new MessageEmbed();


module.exports = {
  name: "module",
  alias: ["modules","editmodule","config","enable","disable"],
  admin: true,
  run: (client, message, command, args, prefix, color, langv) => {

    lang = langv;

    vmembed.setTitle(lang.valid_modules)
    .setColor(color)
    .setDescription(validModules.toString().split(',').join('\n'))

    var requestedModule = args[0];
    if (requestedModule == null || requestedModule == "") return message.channel.send({embeds:[vmembed]});
    else requestedModule = requestedModule.toLowerCase();

    if (command == "enable" || command == "disable") return switchModule(message, requestedModule, command == "enable", color);

    var action = args[1];
    if (action == null || action == "") return sendHelp(message, requestedModule, color);
    else action = action.toLowerCase();

    switch (action) {
      case "enable":
      switchModule(message, requestedModule, true, color);
      break;

      case "disable":
      switchModule(message, requestedModule, false, color);
      break;

      default:
      checkAction(message, requestedModule, action, color, args);
      break;
    }

  }
}

async function switchModule(message, modulearg, enable, color) {
  if (modulearg == null || modulearg == "") {
      message.channel.send({embeds:[vmembed]})
      return;
  }
  const guildID = message.guild.id
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild == null) return db.close();
  const modules = guild.modules
  if (modules == null) return db.close();
  if (validModules.indexOf(modulearg) == -1) {
    db.close();
    vmembed = new MessageEmbed()
    .setTitle(lang.valid_modules)
    .setColor(color)
    .setDescription(validModules.toString().split(',').join('\n'))
    message.channel.send({embeds:[vmembed]});
    return;
  } else {
    const desiredModule = modules.find((c) => c.name == modulearg);
    if (desiredModule==null) {
      moduleModel = defaultModules.find((c) => c.name == modulearg);
      modules.push(moduleModel);
    } else {
      desiredModule.enabled = enable;
    }
    await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
    db.close();
    txt = (enable) ? lang.module_enabled : lang.module_disabled;
    message.channel.send(txt.replace('{0}', modulearg));
    await reloadSlashCommands(message.guild.client, message.guild, lang);
  }
}

async function sendHelp(message, requestedModule, color) {
  const guildID = message.guild.id;
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild == null) return db.close();
  const modules = guild.modules
  if (modules == null) return db.close();
  if (validModules.indexOf(requestedModule) == -1) {
    db.close();
    message.channel.send({embeds:[vmembed]});
    return;
  } else {
    moduleObj = modules.find((c) => c.name == requestedModule);
    if (moduleObj == null) {
      moduleModel = defaultModules.find((c) => c.name == requestedModule);
      modules.push(moduleModel);
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      db.close();
      return sendHelp(message, requestedModule, color);
    }
    const helpEmbed = new MessageEmbed().setTitle(requestedModule).setColor(color);
    moduleModel = defaultModules.find((c) => c.name == requestedModule);
    for (key of Object.keys(moduleModel)) {
      if (!moduleObj.hasOwnProperty(key)) {
        moduleObj[key] = moduleModel[key];
      }
    }
    for (key of Object.keys(moduleObj)) {
      if (!moduleModel.hasOwnProperty(key)) {
        delete moduleObj[key];
        continue;
      }
      if (key != "name")
      switch (typeof moduleObj[key]) {
        case 'boolean':
        if (moduleObj[key]) helpEmbed.addField(key, '✅')
        else helpEmbed.addField(key, '❌')
        break;
        case 'string':
        var content = moduleObj[key]
        if (content == '') content = '...'
        if (key == 'channel') helpEmbed.addField(key, content == '...' ? content : `<#${content}>`);
        else if (key == 'message' && content == 'default') {
          if (requestedModule == 'welcome') helpEmbed.addField(key, lang.welcome_to_guild);
          else if (requestedModule == 'goodbye') helpEmbed.addField(key, lang.goodbye_user);
        }
        else helpEmbed.addField(key, content);
        break;
        case 'number':
        helpEmbed.addField(key, moduleObj[key].toString());
        case 'object':
        if (Array.isArray(moduleObj[key])) {
          if (moduleObj[key].length == 0)
          helpEmbed.addField(key, '[]');
          else {
            if (key=="allowedChannels") {
              let channels = moduleObj[key];
              for (key of Object.keys(channels)) {
                channels[key] = `<#${channels[key]}>`
              }
              helpEmbed.addField("allowedChannels", channels.toString().split(',').join('\n'));
            }
            else helpEmbed.addField(key, moduleObj[key].toString().split(',').join('\n'));
          }
        }
      }
    }
    await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
    db.close();
    message.channel.send({embeds:[helpEmbed]});
  }
}

async function checkAction(message, requestedModule, action, color, args) {
  const guildID = message.guild.id;
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild == null) return db.close();
  const modules = guild.modules;
  if (modules == null) return db.close();
  if (validModules.indexOf(requestedModule) == -1) {
    db.close();
    message.channel.send({embeds:[vmembed]});
    return;
  } else {
    const moduleObj = modules.find((c) => c.name == requestedModule);
    if (moduleObj==null) {
      moduleModel = defaultModules.find((c) => c.name == requestedModule);
      modules.push(moduleModel);
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      db.close();
      return checkAction(message, requestedModule, action, color, args);
    }
    if (action == 'reset') {
      moduleModel = defaultModules.find((c) => c.name == requestedModule);
      for (var key in moduleObj) {
        if (moduleObj.hasOwnProperty(key)){
          delete moduleObj[key];
        }
      }
      for (key of Object.keys(moduleModel)) {
        moduleObj[key] = moduleModel[key]
      }
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      db.close();
      message.channel.send(lang.module_reset);
    } else
    for (key of Object.keys(moduleObj)) {
      if (args[1] == key) {
        switch (args[1]) {
          case 'allowedChannels':
          if (args.length > 2) {
            args.shift();
            args.shift();
            await message.guild.channels.fetch();
            for (key of Object.keys(args)) {
              if (args[key].startsWith('<#')) args[key] = args[key].substring(2,args[key].length-1);
              if (!message.guild.channels.cache.get(args[key])) {
                db.close();
                return message.reply(lang.invalid_channel);
              }
            }
            moduleObj.allowedChannels = args;
            await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
            db.close();
            message.channel.send(lang.module_updated);
            return sendHelp(message, requestedModule, color);
          } else {
            db.close();
            return message.reply(lang.please_specify_one_or_more_channels);
          }
          break;
          default:
          if (typeof moduleObj[key] == 'boolean') {
            if (args.length > 1) {
              var keybool;
              switch (args[2]) {
                case 'true':
                keybool = true;
                break;
                case 'false':
                keybool = false;
                break;
                default:
                db.close();
                return message.reply(lang.value_must_be_true_or_false)
                break;
              }
              moduleObj[key] = keybool;
              await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
              db.close();
              message.channel.send(lang.module_updated);
              return sendHelp(message, requestedModule, color);
            } else {
              db.close();
              return message.reply(lang.please_specify_a_new_value);
            }
          } else {
            if (args.length > 1) {
              moduleObj[key] = args[2];
              switch (key) {
                case 'channel':
                  if (moduleObj[key].startsWith('<#')) {
                    moduleObj[key] = moduleObj[key].substring(2,moduleObj[key].length-1);
                  }
                  await message.guild.channels.fetch();
                  if (!message.guild.channels.cache.get(moduleObj[key])) {
                    db.close();
                    return message.reply(lang.please_type_a_valid_channel);
                  }
                  break;
                case 'message':
                  args.shift();
                  args.shift();
                  moduleObj[key] = message.content.slice(message.content.indexOf('message')+8,message.length);
                  break;
                case 'filter':
                  if (isNaN(parseInt(moduleObj[key]))) {
                    db.close();
                    return message.reply(lang.please_type_a_filter_id);
                  }
                  moduleObj[key] = parseInt(moduleObj[key]);
                  try {
                    await fetch(`https://manebooru.art/api/v1/json/filters/${moduleObj[key]}`)
                      .then(res => res.json())
                      .then(json => {
                        if (json.filter == null) {
                          db.close();
                          return message.reply(lang.filter_not_found);
                        }
                      });
                  } catch (e) {
                    db.close();
                    return message.reply(lang.filter_not_found);
                  }
                  break;
              }
              await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
              db.close();
              message.channel.send(lang.module_updated);
              return sendHelp(message, requestedModule, color);
            } else {
              db.close();
              return message.reply(lang.please_specify_a_new_value);
            }
          }
        }
      }
    }
  }
}
