module.exports = {
  name: "clean",
  alias: ["bulkdelete","bulk-delete","clear","purge"],
  admin: true,
  run: async (client, message, command, args, prefix, color, lang) => {

    if (!message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) return message.reply(lang.bulk_delete_missing_permissions);
    if (args[0]!=null) {
      messagesToDelete = parseInt(args[0]);
      if (message.author) messagesToDelete++;
      if (messagesToDelete <= 100) {
        message.channel.bulkDelete(messagesToDelete)
        .catch(rej => {
          message.reply(lang.bulk_delete_two_weeks);
        });
      } else message.reply(lang.bulk_delete_max_100);
    }
  }
}
