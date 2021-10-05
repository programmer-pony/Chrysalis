const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
let Parser = require('rss-parser');
let parser = new Parser();

module.exports = {
  name: "mlp",
  alias: ["episode","episodes","mylittlepony","torrent","torrents","fim","mlpfim","download"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang) => {

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
    const sentEmbed = message.author ? await message.channel.send({embeds:[seasonEmbed[1]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]}) : await message.editReply({embeds:[seasonEmbed[1]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
    const filter = (interaction) => interaction.user.id === message.member.user.id;
    const collector = sentEmbed.createMessageComponentCollector({filter,  time: 120000 });
    var currentPage = 1;
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
          sentEmbed.edit({embeds:[seasonEmbed[currentPage].setFooter(`${seasonEmbed[currentPage].footer.text}\n${lang.help_time_out}`)], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
        } catch (e) {}
      }
    });

  }
}
