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

const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const iconURL = 'https://yayponies.no/favicon-32x32.png';
let Parser = require('rss-parser');
let parser = new Parser();

module.exports = {
  name: 'torrent',
  alias: ['torrents','episode','episodes','mylittlepony','mlp','fim','mlpfim','download','movie','movies'],
  run: async (client, message, command, args, lang, guildInfo) => {

    try { // Just in case yayponies is down
    let season = [];
    let feed = await parser.parseURL('https://yayponies.no/videos/rss/1it.rss');
    feed.items.forEach(item => {
      let currentSeason = parseInt(item.title.slice(item.title.indexOf('0'),item.title.indexOf('0')+2));
      let currentEpisode = parseInt(item.title.slice(item.title.indexOf('x')+1,item.title.indexOf('x')+3));
      season[currentSeason] ??= {episode:[]};
      season[currentSeason].episode[currentEpisode] = {
        title: item.title.slice(item.title.indexOf('0'),item.title.indexOf('|')),
        link: item.link
      }
    });

    let seasonEmbed = [];
    for (s of Object.keys(season)) {
      if (!s) continue;
      seasonEmbed[s] = new MessageEmbed()
        .setTitle(`${lang.season} ${s}`)
        .setColor(guildInfo.color)
        .setFooter({text:lang.torrent_footer,iconURL:iconURL})
      let episodes = [];
      for (e of season[s].episode) {
        if (!e) continue;
        episodes = `${episodes || ''}[${e.title}](${e.link})\n`;
      }
      seasonEmbed[s].setDescription(episodes);
    }

    // Movies
    seasonEmbed[10] = new MessageEmbed()
      .setTitle(lang.movies)
      .setColor(guildInfo.color)
      .setFooter({text:lang.torrent_footer,iconURL:iconURL})
      .setDescription(`[My Little Pony: The Movie](https://yayponies.no/videos/torrents/YP-1R-TheMovie.mkv.torrent)
        [My Little Pony: A New Generation](https://yayponies.no/videos/torrents/YP-1N-G5-ANewGeneration.mkv.torrent)`);

    let leftButton = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('<')
      .setCustomId('left')
      .setDisabled(true);
    let rightButton = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('>')
      .setCustomId('right');
    let sentEmbed = message.author ? await message.channel.send({embeds:[seasonEmbed[1]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]}) : await message.editReply({embeds:[seasonEmbed[1]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
    let filter = (interaction) => interaction.user.id === message.member.user.id;
    let collector = sentEmbed.createMessageComponentCollector({filter,  time: 120000 });
    let currentPage = 1;
    collector.on('collect', async (i) => {
      if (i.customId == 'left') {
        if (currentPage > 0) currentPage--;
        leftButton.setDisabled(currentPage == 1);
        rightButton.setDisabled(false);
      } else {
        if (currentPage < seasonEmbed.length - 1) currentPage++;
        rightButton.setDisabled(currentPage == seasonEmbed.length - 1);
        leftButton.setDisabled(false);
      }
      try {
        await sentEmbed.edit({embeds:[seasonEmbed[currentPage]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]}).then(i.deferUpdate());
      } catch (e) {}
    });
    collector.on('end', async (collected, reason) => {
      if (reason == 'time') {
        leftButton.setDisabled(true);
        rightButton.setDisabled(true);
        try {
          await sentEmbed.edit({embeds:[seasonEmbed[currentPage].setFooter({text:`${seasonEmbed[currentPage].footer.text}\n${lang.help_time_out}`, iconURL:iconURL})], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
        } catch (e) {}
      }
    });
  } catch (e) { return message.author ? message.reply({content:lang.error_fetching_episodes}) : message.editReply({content:lang.error_fetching_episodes}); }
  }
}
