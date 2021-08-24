const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
let Parser = require('rss-parser');
let parser = new Parser();
var lang = require('../lang/en.json');

module.exports = {
  name: "mlp",
  alias: ["episode","episodes","mylittlepony","torrent","torrents","fim","mlpfim","download"],
  admin: false,
  run: async (client, message, command, args, prefix, color, langstr) => {

    lang = require(`../lang/${langstr}.json`);
    message.channel.sendTyping();
    season = [];
    try { // Just in case yayponies is down
      feed = await parser.parseURL('https://yayponies.no/videos/rss/1it.rss');
    } catch (e) {
      return message.reply(lang.error_fetching_episodes);
    }
    feed.items.forEach(item => {
      const currentSeason = parseInt(item.title.slice(item.title.indexOf('0'),item.title.indexOf('0')+2));
      const currentEpisode = parseInt(item.title.slice(item.title.indexOf('x')+1,item.title.indexOf('x')+3));
      if (season[currentSeason] == null) season[currentSeason] = {episode:[]};
      season[currentSeason].episode[currentEpisode] = {
        title: item.title.slice(item.title.indexOf('0'),item.title.indexOf('|')),
        link: item.link
      }
    });

    seasonEmbed = [];
    for (s of Object.keys(season)) {
      if (s==0) continue;
      seasonEmbed[s] = new MessageEmbed()
        .setTitle(`${lang.season} ${s}`)
        .setColor(color)
        .setFooter(lang.torrent_footer)
      var episodes = [];
      for (e of season[s].episode) {
        if (e==null) continue;
        episodes = `${episodes || ''}[${e.title}](${e.link})\n`;
      }
      seasonEmbed[s].setDescription(episodes);
    }

    // Movies
    seasonEmbed[10] = new MessageEmbed()
      .setTitle(lang.movies)
      .setColor(color)
      .setFooter(lang.torrent_footer)
      .setDescription('[My '+'Little '+'Pony: '+'The Movie](https://yayponies.no/videos/torrents/YP-1R-TheMovie.mkv.torrent)')

    const leftButton = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('<')
      .setCustomId('left')
      .setDisabled(true);
    const rightButton = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('>')
      .setCustomId('right');
    const sentEmbed = await message.channel.send({embeds:[seasonEmbed[1]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = sentEmbed.createMessageComponentCollector({filter,  time: 120000 });
    var currentPage = 1;
    collector.on('collect', (i) => {
      if (i.customId == 'left') {
        currentPage--;
        leftButton.setDisabled(currentPage == 1);
        rightButton.setDisabled(false);
      } else {
        currentPage++;
        rightButton.setDisabled(currentPage == seasonEmbed.length - 1);
        leftButton.setDisabled(false);
      }
      sentEmbed.edit({embeds:[seasonEmbed[currentPage]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
    });
    collector.on('end', (collected, reason) => {
      if (reason == 'time') {
        leftButton.setDisabled(true);
        rightButton.setDisabled(true);
        sentEmbed.edit({embeds:[seasonEmbed[currentPage].setFooter(`${seasonEmbed[currentPage].footer.text}\n${lang.help_time_out}`)], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
      }
    });

  }
}
