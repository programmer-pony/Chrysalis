const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = {
  name: "help",
  alias: ["commands"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang) => {

    const helpModules = client.commands.filter(c => !c.admin && c.name!='help').map(c => c.name);

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
    if (modules==null) return db.close();

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
        if (helpEmbed[i]?.fields.length == 5) i++;
        if (helpEmbed[i] == null) helpEmbed[i] = new MessageEmbed()
          .setColor(color)
          .setTitle(`__**${lang.user_commands}**__`);
        if (lang.help.user[moduleName][2]!=null && lang.help.user[moduleName][2]=="NSFW") helpEmbed[i].addField("`"+prefix+lang.help.user[moduleName][0]+"` ⚠",lang.help.user[moduleName][1]);
        else helpEmbed[i].addField("`"+prefix+lang.help.user[moduleName][0]+"`",lang.help.user[moduleName][1]);
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
      collector.on('collect', async (i) => {
        if (i.customId == 'left') {
          if (currentPage > 0) currentPage--;
          leftButton.setDisabled(currentPage == 0);
          rightButton.setDisabled(false);
        } else {
          if (currentPage < helpEmbed.length - 1) currentPage++;
          rightButton.setDisabled(currentPage == helpEmbed.length - 1);
          leftButton.setDisabled(false);
        }
        try {
          await sentEmbed.edit({embeds:[helpEmbed[currentPage]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]}).then(i.deferUpdate());
        } catch (e) {}
      });
      collector.on('end', async (collected, reason) => {
        if (reason == 'time') {
          leftButton.setDisabled(true);
          rightButton.setDisabled(true);
          try {
            await sentEmbed.edit({embeds:[helpEmbed[currentPage].setFooter(lang.help_time_out)], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
          } catch (e) {}
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
      collector.on('collect', async (i) => {
        if (i.customId == 'left') {
          if (currentPage > 0) currentPage--;
          leftButton.setDisabled(currentPage == 0);
          rightButton.setDisabled(false);
        } else {
          if (currentPage < adminHelpEmbed.length - 1) currentPage++;
          rightButton.setDisabled(currentPage == adminHelpEmbed.length - 1);
          leftButton.setDisabled(false);
        }
        try {
          await sentEmbed.edit({embeds:[adminHelpEmbed[currentPage]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]}).then(i.deferUpdate());
        } catch (e) {}
      });
      collector.on('end', async (collected, reason) => {
        if (reason == 'time') {
          leftButton.setDisabled(true);
          rightButton.setDisabled(true);
          try {
            await sentEmbed.edit({
              embeds:[adminHelpEmbed[currentPage].setFooter(lang.help_time_out)],
              components: [new MessageActionRow().addComponents([leftButton, rightButton])]
            });
          } catch (e) {}
        }
      });
    }

  }
}
