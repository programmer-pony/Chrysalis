const { MessageEmbed } = require('discord.js');
var lang = require('../lang/en.json');

module.exports = {
  name: "jumbo",
  alias: ["emoji"],
  admin: false,
  run: async (client, message, command, args, prefix, color, langstr) => {

    lang = require(`../lang/${langstr}.json`);
    await message.channel.sendTyping();

    if (!args[0] || args[0].split(':')[1] == null) return message.reply(lang.you_must_send_an_emoji);

    await message.guild.emojis.fetch();
    if (args[0].split(':')[2]!=null) {
      emoji = client.emojis.resolve(args[0].split(':')[2].replace('>',''));
    }
    emoji ??= client.emojis.cache.find((e) => e.name === args[0].split(':')[1]);
    if (!emoji) return message.reply(lang.couldn_t_find_that_emoji);

    const embed = new MessageEmbed()
    .setTitle(lang.download_emoji)
    .setURL(emoji.url)
    .setImage(emoji.url)
    .setColor(color);
    message.channel.send({embeds:[embed]});
  }
}
