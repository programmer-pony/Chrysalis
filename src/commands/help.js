const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
var lang = require('../lang/en.json');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = {
  name: "help",
  alias: ["commands"],
  admin: false,
  run: async (client, message, command, args, prefix, color, langstr) => {

    const helpModules = client.commands.filter(c => !c.admin && c.name!='help').map(c => c.name);

    lang = require(`../lang/${langstr}.json`);

    const guildID = message.guild.id
    const channelID = message.channel.id
    const db = new MongoClient(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await db.connect();
    const dbo = db.db("chrysalis");
    const guilds = dbo.collection("guilds");
    const guild = await guilds.findOne({id: guildID});
    const modules = guild.modules;
    if (guild.nsfw == null || guild.nsfw == "") {
      await guilds.updateOne({id: guildID},{ $set: { nsfw: true}});
      guild.nsfw = true;
    }
    if (modules==null) return db.close();

    commandsEmbed = new MessageEmbed()
    .setColor(color)
    .setTitle(`__**${lang.commands}**__`);


    helpEmbed = [];
    let i = 0;
    const defaultModules = require('../defaultModules.json').modules;
    for (moduleName of helpModules) {

      helpModule = modules.find((c) => c.name == moduleName);
      if (helpModule == null) {
        moduleModel = defaultModules.find((c) => c.name == moduleName);
        modules.push(moduleModel);
        await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
        helpModule = modules.find((c) => c.name == moduleName);
      }

      if (helpModule.enabled) {
        for (ch of lang.help.user[moduleName]) {
          if (helpEmbed[i]?.fields.length == 5) i++;
          if (helpEmbed[i] == null) helpEmbed[i] = new MessageEmbed()
            .setColor(color)
            .setTitle(`__**${lang.commands}**__`);
          if (ch[2]!=null && ch[2]=="NSFW" && guild.nsfw) helpEmbed[i].addField("`"+prefix+ch[0]+"` ⚠",ch[1]);
          else helpEmbed[i].addField("`"+prefix+ch[0]+"`",ch[1]);
        }
      }
    }

    db.close();

    if (helpEmbed.length > 1) {
      const leftButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('<')
        .setCustomId('left')
        .setDisabled(true);
      const rightButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('>')
        .setCustomId('right');
      const sentEmbed = await message.channel.send({embeds:[helpEmbed[0]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = sentEmbed.createMessageComponentCollector({filter,  time: 120000 });
      let currentPage = 0;
      collector.on('collect', (i) => {
        if (i.customId == 'left') {
          if (currentPage > 0) currentPage--;
          leftButton.setDisabled(currentPage == 0);
          rightButton.setDisabled(false);
        } else {
          if (currentPage < helpEmbed.length - 1) currentPage++;
          rightButton.setDisabled(currentPage == helpEmbed.length - 1);
          leftButton.setDisabled(false);
        }
        sentEmbed.edit({embeds:[helpEmbed[currentPage]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]}).then(i.deferUpdate());
      });
      collector.on('end', (collected, reason) => {
        if (reason == 'time') {
          leftButton.setDisabled(true);
          rightButton.setDisabled(true);
          sentEmbed.edit({embeds:[helpEmbed[currentPage].setFooter(lang.help_time_out)], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
        }
      });
    } else {
      message.channel.send({embeds:[helpEmbed[0]]});
    }

    if (message.member.permissions.has('ADMINISTRATOR')) {
      adminHelpEmbed = [];
      let i = 0;
      for (ch of lang.help.admin) {
        if (adminHelpEmbed[i]?.fields.length == 5) i++;
        if (adminHelpEmbed[i] == null) adminHelpEmbed[i] = new MessageEmbed()
          .setColor(color)
          .setTitle(`__**${lang.admin_commands}**__`);
        adminHelpEmbed[i].addField("`"+prefix+ch[0]+"`",ch[1]);
      }
      const leftButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('<')
        .setCustomId('left')
        .setDisabled(true);
      const rightButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('>')
        .setCustomId('right');
      const sentEmbed = await message.channel.send({embeds:[adminHelpEmbed[0]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = sentEmbed.createMessageComponentCollector({filter,  time: 120000 });
      let currentPage = 0;
      collector.on('collect', (i) => {
        if (i.customId == 'left') {
          if (currentPage > 0) currentPage--;
          leftButton.setDisabled(currentPage == 0);
          rightButton.setDisabled(false);
        } else {
          if (currentPage < adminHelpEmbed.length - 1) currentPage++;
          rightButton.setDisabled(currentPage == adminHelpEmbed.length - 1);
          leftButton.setDisabled(false);
        }
        sentEmbed.edit({embeds:[adminHelpEmbed[currentPage]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]}).then(i.deferUpdate());
      });
      collector.on('end', (collected, reason) => {
        if (reason == 'time') {
          leftButton.setDisabled(true);
          rightButton.setDisabled(true);
          sentEmbed.edit({embeds:[adminHelpEmbed[currentPage].setFooter(lang.help_time_out)], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
        }
      });
    }

  }
}
