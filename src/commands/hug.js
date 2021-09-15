const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "hug",
  alias: ["hugs","cuddle","cuddles","snuggle","snuggles"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang) => {

    if (args[0]==null || args[0]=="") return message.reply(lang.please_specify_a_user);

    author = message.member.nickname || message.member.user.username;

    var onSelf = false;
    var onChrysalis = false;

    if (message.mentions?.members.first()) {
      if (message.mentions.members.first().user.id == message.author.id) onSelf = true;
      if (message.mentions.members.first().user.id == client.user.id) onChrysalis = true;
      if (message.mentions.members.first().nickname)
      targetUser = message.mentions.members.first().nickname
      else targetUser = message.mentions.members.first().user.username
      if (message.mentions.members.first().displayHexColor!="#000000")
      color = message.mentions.members.first().displayHexColor;
    }
    else if (message.mentions?.users.first()) targetUser = message.mentions.users.first().username;
    else if (args[0].startsWith("<@!")) {
      try {
        targetUser = await client.users.fetch(args[0].substring(3,args[0].length-1));
        if (targetUser.id == client.user.id) onChrysalis = true;
        targetUser = targetUser.username;
      } catch (e) {
        targetUser = args[0];
      }
    } else if (args[0].startsWith("<@")) {
      try {
        targetUser = await client.users.fetch(args[0].substring(2,args[0].length-1));
        if (targetUser.id == client.user.id) onChrysalis = true;
        targetUser = targetUser.username;
      } catch (e) {
        targetUser = args[0];
      }
    } else {
      try {
        targetUser = await client.users.fetch(args[0]);
        if (targetUser.id == client.user.id) onChrysalis = true;
        targetUser = targetUser.username;
      } catch (e) {
        targetUser = args.toString().split(',').join(' ');
      }
    }
    if (targetUser == '@everyone' || targetUser == '@here') targetUser = 'everypony';

    const gifs = [
      "https://cdn.discordapp.com/attachments/862296245922037800/874333300225876088/cute.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874333323147755650/startrix.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874342011451346975/startrix2.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874342394538127360/bon-bon-mlp-lyra-mlp.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874333325500751872/4d0.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874333325114892308/uwu.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874333331221778473/uwuu.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874333354353393684/spike.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874333362058301520/tactical_hug_incoming.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/874333368018432020/2b57ddaa1c0199acf9480ef192299a81.gif"
    ];

    const embed = new MessageEmbed()
    .setColor(color);

    if (onSelf) embed.setTitle(lang.hug_self.replace(`{0}`,author))
    .setImage("https://cdn.discordapp.com/attachments/862296245922037800/874334737542549514/-_self.gif");
    else if (onChrysalis) embed.setTitle(lang.hug_chrysalis.replace(`{0}`,author))
    .setImage("https://cdn.discordapp.com/attachments/862296245922037800/874339818073632818/-_chrysalis.gif");
    else if (targetUser == 'everypony') embed.setTitle(lang.hug_title.replace('{0}',author).replace('{1}',targetUser))
    .setImage("https://cdn.discordapp.com/attachments/862296245922037800/876471497655468032/-_everypony.gif")
    else embed.setTitle(lang.hug_title.replace('{0}',author).replace('{1}',targetUser))
    .setImage(gifs[Math.floor(Math.random() * gifs.length)])

    if (message.author == null) message.editReply({embeds:[embed]});
    else message.channel.send({embeds:[embed]});

  }

}
