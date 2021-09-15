const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "roleinfo",
  alias: ["role-info","ri"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang) => {

    await message.guild.members.fetch();
    await message.guild.roles.fetch();

    if (args[0] == null) return message.reply(lang.unkown_role);

    let requestedRole = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(args.join(' ').toLowerCase()));
    requestedRole ??= message.guild.roles.cache.find(role => role.id == args[0]);
    requestedRole ??= message.guild.roles.cache.find(role => role.id == args[0].substring(3,args[0].length-1));
    if (requestedRole!=null) {

      created = Math.trunc(requestedRole.createdTimestamp / 1000)

        let roleEmbed = new MessageEmbed()
        .setDescription(`__**${lang.role_info}**__`)
        .setColor(requestedRole.hexColor)
        .addField(lang.name, `${requestedRole}`)
        .addField(lang.role_id, `${requestedRole.id}`)
        .addField(lang.color, requestedRole.hexColor)
        .addField(lang.member_count, requestedRole.members.size.toString())
        .addField(lang.date_created, `<t:${created}:F> (<t:${created}:R>)`);

        if (message.author) message.channel.send({embeds:[roleEmbed]});
        else message.editReply({embeds:[roleEmbed]});

      } else message.reply(lang.unkown_role);

  }
}
