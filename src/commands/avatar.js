const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "avatar",
  alias: ["pfp"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang) => {

    taggedUser = args[0];

    if (taggedUser == null || taggedUser == '') taggedUser = message.member.user.id;
    else {
      if (taggedUser.includes("<@!")) taggedUser = taggedUser.substring(3,taggedUser.length-1);
      if (taggedUser.startsWith("<@")) taggedUser = taggedUser.substring(2,taggedUser.length-1);
    }

    try {
      taggedUser = await client.users.fetch(taggedUser);

      /* If it's Chrysalis, send artwork */
      const artwork = "https://www.deviantart.com/mirroredsea/art/Chrysalis-718716441";
      if (taggedUser.id == client.user.id)
      if (message.author) return message.channel.send(artwork);
      else return message.editReply(artwork);

      let avatarembed = new MessageEmbed()
      .setTitle(lang.avatar.replace("{0}",taggedUser.username))
      .setImage(taggedUser.displayAvatarURL()+"?size=1024")
      .setColor(color)
      if (message.author) return message.channel.send({embeds:[avatarembed]});
      else return message.editReply({embeds:[avatarembed]});
    } catch (e) {
      if (message.author) return message.reply(lang.couldn_t_find_that_user);
      else message.editReply({content:lang.couldn_t_find_that_user})
    }

  }
}
