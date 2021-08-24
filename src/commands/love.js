const { MessageEmbed } = require('discord.js');
var lang = require('../lang/en.json');

module.exports = {
  name: "love",
  alias: ["amor","lovemeter","ship"],
  admin: false,
  run: (client, message, command, args, prefix, color, langstr) => {

    lang = require(`../lang/${langstr}.json`);

    if (!message.mentions.users.first()) return message.reply(lang.type_one_or_two_users);

    lovers = Array.from(message.mentions.users.values())

    if (lovers[0] == null || lovers[0] == '') return console.log('xd')
    if (lovers[1] == null || lovers[1] == '') {
      if (lovers[0].id == message.author.id) return message.channel.send(lang.self_love);
      lovers[1] = lovers[0];
      lovers[0] = message.author;
    }

    if (lovers[0].id == message.author.id && lovers[1].id == message.author.id) return message.channel.send(lang.self_love);
    if (lovers[1] == lovers[0]) return message.channel.send("...");

    var lovePercent = Math.floor(Math.random()*100+1);
    switch (Math.floor(lovePercent/10)) {
      case 0:
      percentBar = "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";
      percentMessage = lang.lovemeter_messages[0];
      break;
      case 1:
      percentBar = "🟥⬜⬜⬜⬜⬜⬜⬜⬜⬜";
      percentMessage = lang.lovemeter_messages[1];
      break;
      case 2:
      percentBar = "🟥🟥⬜⬜⬜⬜⬜⬜⬜⬜";
      percentMessage = lang.lovemeter_messages[2];
      break;
      case 3:
      percentBar = "🟥🟥🟥⬜⬜⬜⬜⬜⬜⬜";
      percentMessage = lang.lovemeter_messages[3];
      break;
      case 4:
      percentBar = "🟥🟥🟥🟥⬜⬜⬜⬜⬜⬜";
      percentMessage = lang.lovemeter_messages[4];
      break;
      case 5:
      percentBar = "🟥🟥🟥🟥🟥⬜⬜⬜⬜⬜";
      percentMessage = lang.lovemeter_messages[5];
      break;
      case 6:
      percentBar = "🟥🟥🟥🟥🟥🟥⬜⬜⬜⬜";
      percentMessage = lang.lovemeter_messages[6];
      break;
      case 7:
      percentBar = "🟥🟥🟥🟥🟥🟥🟥⬜⬜⬜";
      percentMessage = lang.lovemeter_messages[7];
      break;
      case 8:
      percentBar = "🟥🟥🟥🟥🟥🟥🟥🟥⬜⬜";
      percentMessage = lang.lovemeter_messages[8];
      break;
      case 9:
      percentBar = "🟥🟥🟥🟥🟥🟥🟥🟥🟥⬜";
      percentMessage = lang.lovemeter_messages[9];
      break;
      case 10:
      percentBar = "🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥";
      percentMessage = lang.lovemeter_messages[10];
      break;
    }

    if (lovers[0].id == client.user.id || lovers[1].id == client.user.id) {
      lovePercent = 0;
      percentBar = "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";
      percentMessage = "...";
    }

    const embed = new MessageEmbed()
    .setTitle(`${lovers[0].username} x ${lovers[1].username}`)
    .setDescription(`${lovePercent}%   ${percentBar}\n${percentMessage}`)
    .setColor(color);
    message.channel.send({embeds:[embed]});
  }
}
