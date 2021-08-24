var lang = require('../lang/en.json');

module.exports = {
  name: "clean",
  alias: ["bulkdelete","bulk-delete","clear","purge"],
  admin: true,
  run: (client, message, command, args, prefix, color, langstr) => {

    lang = require(`../lang/${langstr}.json`);

    if (!message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) return message.reply(lang.bulk_delete_missing_permissions);
    if (args[0]!=null) {
      if (args[0] <= 99) {
        message.channel.bulkDelete(parseInt(args[0])+1)
        .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
        .catch(rej => {
          message.reply(lang.bulk_delete_two_weeks);
        });
      } else message.reply(lang.bulk_delete_max_100);
    }
  }
}
