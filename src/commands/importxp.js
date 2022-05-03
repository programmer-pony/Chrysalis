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

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fetch = require('node-fetch');
const formatLeaderboard = require('../utils/embed/formatLeaderboard.js');
const connectToDatabase = require('../utils/connectToDatabase.js');
const bots = ['MEE6', 'AmariBot'];

module.exports = {
  name: 'importxp',
  alias: ['importlevels','migratexp','migratelevels','transferxp','transferlevels'],
  admin: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    // Ask which bot to import levels from

    let row = new MessageActionRow();
    for (bot of bots) row.addComponents([new MessageButton({
      label: bot,
      customId: bot,
      style: 'SECONDARY'
    })]);
    let botMessage = await message.reply({
      content: lang.import_levels_from,
      components: [row]
    });
    let filter = (interaction) => interaction.user.id === message.author.id;
    let collector = botMessage.createMessageComponentCollector({filter: filter,  time: 12000 });
    collector.on('end', async (collected, reason) => {
      if (reason == 'time') dismiss(message, botMessage);
    });
    collector.on('collect', async (bot) => {
      collector.stop();
      await bot.deferUpdate();

      // Ask how to handle data

      await botMessage.edit({content:lang.xp_migration_adapt, components: [new MessageActionRow().addComponents([
        new MessageButton({
          label: lang.import_levels_and_adapt_xp,
          customId: 'levels',
          style: 'PRIMARY'
        }),
        new MessageButton({
          label: lang.import_xp_and_adapt_levels,
          customId: 'xp',
          style: 'SECONDARY'
        })
      ])]});
      let collector2 = botMessage.createMessageComponentCollector({filter,  time: 120000 });
      collector2.on('end', async (collected, reason) => {
        if (reason == 'time') dismiss(message, botMessage);
      });
      collector2.on('collect', async (i) => {
        collector2.stop();
        await i.deferUpdate();

        // Get the levels data from the selected bot

        let users = [];
        switch (bot.customId) {
          case 'MEE6':
            let p = 0;
            while (true) {
              let json = await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${message.guild.id}?page=${p}`).then(res => res.json());
              if (json.error) return botMessage.edit({embeds:[new MessageEmbed()
                .setTitle('Error')
                .setDescription(`${lang.no_levels_found.replace('{bot}',bot.customId)} ${lang.mee6_fix}`)
                .setColor('#e12929')
                .setImage('https://cdn.discordapp.com/attachments/862296245922037800/970653208777211994/unknown.png')
              ],components:[],content:null});
              if (!json?.players?.length) break;
              for (player of json.players) users.push({
                id:player.id,
                xp: i.customId == 'xp' ? player.xp : player.level*player.level*5
              });
              p++;
            }
            break;
          case 'AmariBot':
            let p1 = 1;
            while (true) {
              let json = await fetch(`https://amaribot.com/guild/leaderboard/${message.guild.id}?page=${p1}`).then(res => res.json());
              for (user of json.data) users.push({
                id: user.id,
                xp: i.customId == 'xp' ? +user.exp.replaceAll(',','') : user.level*user.level*5
              });
              if (!json.total_count || users.length > json.total_count) break;
              p1++;
            }
            break;
        }
        if (!users.length) return botMessage.edit({embeds:[new MessageEmbed()
          .setTitle('Error')
          .setDescription(`${lang.no_levels_found.replace('{bot}',bot.customId)}`)
          .setColor('#e12929')
        ],components:[],content:null});

        let leaderboard = await formatLeaderboard(users, message.guild, guildInfo, lang);
        await botMessage.edit({
          content: lang.import_leaderboard,
          embeds: [leaderboard],
          components: [new MessageActionRow().addComponents([
            new MessageButton({
              label: '✓',
              customId: 'yes',
              style: 'SUCCESS'
            }),
            new MessageButton({
              label: '×',
              customId: 'no',
              style: 'DANGER'
            })
          ])]
        })
        let collector3 = botMessage.createMessageComponentCollector({filter,  time: 120000 });
        collector3.on('end', async (collected, reason) => {
          if (reason == 'time') dismiss(message, botMessage);
        });
        collector3.on('collect', async (confirm) => {
          collector3.stop();
          await confirm.deferUpdate();
          if (confirm.customId == 'no') return dismiss(message, botMessage);

          // Set user xp

          let db = await connectToDatabase();
          let guilds = db.db('chrysalis').collection('guilds');
          let guild = await guilds.findOne({id: message.guild.id});
          let modules = guild.modules;
          let rank = modules.find((c) => c.name == 'rank');
          rank.users = users;
          await guilds.updateOne({id: message.guild.id},{ $set: { modules: modules}});
          await db.close();
          await botMessage.edit({content:null, components:[], embeds:[{
            title: lang.migration_complete,
            description: lang.xp_successfully_imported,
            color: '#44bf44'
          }]});

        });
      });
    });
  }
}

async function dismiss(message, botMessage) {
  try {
    await botMessage.delete();
    await message.delete();
  } catch (e) {}
}
