const { MessageEmbed } = require('discord.js');
var lang = require('../lang/en.json');

module.exports = {
  name: "userinfo",
  alias: ["user-info","avatar"],
  admin: false,
  run: (client, message, command, args, prefix, color, langstr) => {

    lang = require(`../lang/${langstr}.json`);
    message.channel.sendTyping();

    var taggedUser = args[0];
    if (message.mentions.members.first()) {
      showMemberInfo(client, command, message, message.mentions.members.first(), color);
    } else {
      if (taggedUser == null || taggedUser == "") return showMemberInfo(client, command, message, message.member, color);
      return asyncMember(client, command, message, taggedUser, color);
    }

  }
}

async function asyncMember(client, command, message, taggedUser, color) {

  if (message.guild.members.cache.get(taggedUser)) {
    taggedUser = await message.guild.members.fetch(taggedUser);
    showMemberInfo(client, command, message, taggedUser, color);
  } else {
    if (taggedUser.includes("<@!")) taggedUser = taggedUser.substring(3,taggedUser.length-1);
    if (taggedUser.startsWith("<@")) taggedUser = taggedUser.substring(2,taggedUser.length-1);
    try {
      taggedUser = await client.users.fetch(taggedUser);
      showUserInfo(client, command, message, taggedUser, color);
    } catch (e) {
      return message.reply(lang.couldn_t_find_that_user);
    }
  }

}

function showMemberInfo(client, command, message, taggedUser, color) {

  if (command == "avatar") return sendMemberAvatar(client, message, taggedUser, color);

  if (taggedUser!=null&&taggedUser!="") {

    joined = Math.trunc(taggedUser.joinedTimestamp / 1000);
    created = Math.trunc(taggedUser.user.createdTimestamp / 1000);

    let memberembed = new MessageEmbed()
    .setDescription(`__**${lang.user_info}**__`)
    .setColor(color)
    .setThumbnail(taggedUser.user.displayAvatarURL()+"?size=1024")
    .addField(lang.name, `${taggedUser.user.username}#${taggedUser.user.discriminator}`)
    .addField(lang.user_id, taggedUser.id)
    .addField(lang.server_join_date, `<t:${joined}:F> (<t:${joined}:R>)`)
    .addField(lang.account_creation_date, `<t:${created}:F> (<t:${created}:R>)`)
    .addField(lang.roles, taggedUser.roles.cache.map(roles => `${roles}`).join(' '), true)
    message.channel.send({embeds:[memberembed]});
  }
  else {
    return message.reply(lang.couldn_t_find_that_user);
  }
}

function showUserInfo(client, command, message, taggedUser, color) {

  if (command == "avatar") return sendUserAvatar(client, message, taggedUser, color);

  if (taggedUser!=null&&taggedUser!="") {

    created = Math.trunc(taggedUser.createdTimestamp / 1000);

    let userembed = new MessageEmbed()
    .setDescription(`__**${lang.user_info}**__`)
    .setColor(color)
    .setThumbnail(taggedUser.displayAvatarURL()+"?size=1024")
    .addField(lang.name, `${taggedUser.username}#${taggedUser.discriminator}`)
    .addField(lang.user_id, taggedUser.id)
    .addField(lang.account_creation_date, `<t:${created}:F> (<t:${created}:R>)`)
    message.channel.send({embeds:[userembed]});
  }
  else {
    return message.reply(lang.couldn_t_find_that_user);
  }
}

function sendMemberAvatar(client, message, taggedUser, color) {
  if (taggedUser.user.id == client.user.id) return message.channel.send("https://www.deviantart.com/mirroredsea/art/Chrysalis-718716441");
  let avatarembed = new MessageEmbed()
  .setTitle(lang.avatar.replace("{0}",taggedUser.user.username))
  .setImage(taggedUser.user.displayAvatarURL()+"?size=1024")
  .setColor(color)
  return message.channel.send({embeds:[avatarembed]});
}

function sendUserAvatar(client, message, taggedUser, color) {
  if (taggedUser.id == client.user.id) return message.channel.send("https://www.deviantart.com/mirroredsea/art/Chrysalis-718716441");
  let avatarembed = new MessageEmbed()
  .setTitle(lang.avatar.replace("{0}",taggedUser.username))
  .setImage(taggedUser.displayAvatarURL()+"?size=1024")
  .setColor(color)
  return message.channel.send({embeds:[avatarembed]});
}
