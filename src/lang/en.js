/*

 Copyright (C) 2022 programmerpony

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

const emojis = require('../emojis.js');

module.exports = {
  meta: {
    name: 'English',
    new_lang_message: `I'll speak in English now.`
  },
  author: 'Author',
  message: 'Message',
  channel: 'Channel',
  user_commands: 'Commands:',
  admin_commands: 'Admin commands:',
  // DO NOT TRANSLATE COMMAND NAMES
  commands: [
    {
      name: 'avatar',
      description: 'Sends the avatar of a user.',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'The user whose avatar you want to be sent.'
        }
      ]
    },
    {
      name: 'userinfo',
      description: 'Shows info about a user.',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'The user you want to display info of.'
        }
      ]
    },
    {
      name: 'roleinfo',
      description: 'Shows info about a role.',
      options: [
        {
          name: 'role',
          type: 'ROLE',
          description: 'The role to display info of.',
          required: true
        }
      ]
    },
    {
      name: 'serverinfo',
      description: 'Shows info about the server.'
    },
    {
      name: 'rank',
      description: 'Shows your current level and XP.',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'The user to display the rank of.'
        }
      ]
    },
    {
      name: 'leaderboard',
      description: 'Shows the users with the most XP.'
    },
    {
      name: 'profile',
      description: 'Edit your profile (on all servers).',
      options: [
        {
          name: 'color',
          type: 'STRING',
          description: 'The hex color for your profile.'
        },
        {
          name: 'background_image',
          type: 'STRING',
          description: 'The background image URL for your profile.'
        }
      ]
    },
    {
      name: 'emoji',
      description: 'Sends the emoji as an image.',
      options: [
        {
          name: 'emoji',
          type: 'STRING',
          description: 'The emoji you want to convert to an image.',
          required: true
        }
      ]
    },
    {
      name: 'love',
      description: 'Checks the compatibility level between two users.',
      options: [
        {
          name: 'lover1',
          type: 'USER',
          description: 'First member of the couple.',
          required: true
        },
        {
          name: 'lover2',
          type: 'USER',
          description: 'Second member of the couple.',
          required: true
        }
      ]
    },
    {
      name: 'boop',
      description: 'Boops a user.',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'The user you want to boop.',
          required: true
        }
      ]
    },
    {
      name: 'hug',
      description: 'Hugs a user.',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'The user you want to hug.',
          required: true
        }
      ]
    },
    {
      name: 'kiss',
      description: 'Kiss a user.',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'The user you want to kiss.',
          required: true
        }
      ]
    },
    {
      name: 'booru',
      description: 'Sends an image from Manebooru.',
      options: [
        {
          name: 'tags',
          type: 'STRING',
          description: 'Tags to search (separated by commas).'
        }
      ]
    },
    {
      name: 'clop',
      description: 'Sends a clop image from Manebooru.',
      options: [
        {
          name: 'tags',
          type: 'STRING',
          description: 'Tags to search (separated by commas).'
        }
      ]
    },
    {
      name: 'e621',
      description: 'Sends an image from e621.',
      options: [
        {
          name: 'tags',
          type: 'STRING',
          description: 'Tags to search (separated by spaces).'
        }
      ]
    },
    {
      name: 'torrent',
      description: 'Torrent ponies!'
    },
    {
      name: 'say',
      description: 'Chrysalis says what you type.',
      options: [
        {
          name: 'text',
          type: 'STRING',
          description: 'The text you want Chrysalis to say.',
          required: true
        }
      ]
    }
  ],
  // DO NOT TRANSLATE COMMAND NAMES
  help: {
    user: {
      avatar: ['avatar {user}', `Sends the mentioned user's profile picture. You can also use the user's ID.`],
      userinfo: ['userinfo {user}', 'Shows info about the user. You can mention them or use their ID.'],
      roleinfo: ['roleinfo {role}', 'Shows info about the role. You can type the name of the role to search for it.'],
      serverinfo: ['serverinfo','Shows info about the server.'],
      rank: ['rank {user (optional)}','Shows your current level and XP.'],
      leaderboard: ['leaderboard','Shows the XP leaderboard.'],
      profile: ['profile {field} {new value}','Edit your profile (on all servers).'],
      emoji: ['jumbo {emoji}', 'Sends the emoji as an image.'],
      love: ['love {user 1} {user 2 (optional)}', 'Checks the compatibility level between two users.'],
      boop: ['boop {user}', 'Boops a user.'],
      hug: ['hug {user}', 'Hugs a user.'],
      kiss: ['kiss {user}', 'Kiss a user.'],
      booru: ['booru {query (optional)}', 'Sends a safe image from Manebooru. You can type search tags.'],
      clop: ['clop {query (optional)}', 'Sends a clop image from Manebooru. You can type search tags. Can only be used in NSFW channels.','NSFW'],
      e621: ['e621 {query (optional)}', 'Sends an image from e621. You can type search tags. Can only be used in NSFW channels.','NSFW'],
      torrent: ['torrent', 'Torrent ponies!'],
      say: ['say {text}', 'Chrysalis says what you type.']
    },
    admin: [
      ['setprefix {prefix}', 'Sets the prefix of the bot commands in this server.'],
      ['setlang {language}', 'Sets the language of the bot in this server.'],
      ['setcolor {hex}', 'Sets the default hex color for embeds.'],
      ['addword {word}', 'Blocks a word in the server.'],
      ['delword {word}', 'Unblocks a word in the server.'],
      ['addwords {words}','Blocks a phrase in the server.'],
      ['delwords {words}', 'Unlocks a phrase in the server.'],
      ['listwords', 'Shows the list of blocked words and phrases.'],
      ['clean {number of messages}', 'Bulk deletes messages. Messages older than two weeks can not be deleted.'],
      ['enable {module}', 'Enables a module.'],
      ['disable {module}', 'Disables a module.'],
      ['config {module}', 'Edits a module.'],
      ['reset {module}', 'Resets a module.'],
      ['rolemenu {roleID} {roleID} {roleID}...', 'Creates a role menu. Every argument is a role ID.'],
      ['welcome {user}', 'Shows a preview of the welcome card for the mentioned user.'],
      ['boost {user}', 'Shows a preview of the boost card.'],
      ['setxp {user} {xp}', 'Sets the amount of XP that a user has.'],
      ['importxp', 'Import XP from other level bots.']
    ]
  },
  defaultValues: {
    boost: {
      message: '**{user} just boosted the server!**',
      title: 'Thank you for boosting the server!',
      description: `${emojis.boost} Enjoy your exclusive role! ${emojis.boost}`
    },
    welcome: {
      message: 'Welcome to **{guild}**! {user}'
    },
    goodbye: {
      message: 'Goodbye, **{user}**. Hope we can see you again soon.',
      banMessage: '**{user}** was banned from the server.'
    }
  },
  wrong_channel: 'The command you sent cannot be used in that channel.',
  blocked_words: 'Blocked words',
  list: 'List',
  word_s_blocked: 'Word(s) blocked',
  word_s_unblocked: 'Word(s) unblocked',
  word_s: 'Word(s)',
  word_s_blocked_by: 'Blocked by',
  word_s_unblocked_by: 'Unblocked by',
  message_deleted: 'Message deleted',
  message_deleted_dm: 'Your message was removed due to containing something not allowed in the server. Please, be careful with what you say.',
  you_must_send_an_emoji: 'You need to send an emoji.',
  couldn_t_find_that_emoji: `Couldn't find that emoji.`,
  type_one_or_two_users: 'Type one or two users.',
  self_love: `I know self-love is important, but don't be a narcissist.`,
  lovemeter_messages: ['Sad.','Incompatible.','Very low... Just friends.','Probably just friends.','Very unlikely but there may be something.','There could be something, but I do not want to give illusions.','Very likely to be something. You can try.','Quite compatible. Could be a cute couple.','These two are making out for sure.','Could be a wonderful couple.','They are meant to be together forever.'],
  nsfw_only: 'This command can only be used in NSFW channels.',
  requested_by: 'Requested by',
  how_to_delete: 'Click here if this image is inappropriate.',
  please_report: `Please report this image so it doesn't show up again.`,
  role_info: 'Role info:',
  name: 'Name',
  color: 'Color',
  member_count: 'Member count',
  date_created: 'Date created',
  couldn_t_find_that_user: `Couldn't find that user.`,
  user_info: 'User info:',
  user_id: 'User ID',
  server_join_date: 'Server join date',
  account_creation_date: 'Account creation date',
  roles: 'Roles',
  avatar: `{0}'s avatar`,
  no_new_words_added: 'No new words were added.',
  no_words_were_removed: 'No words were removed.',
  bulk_delete_two_weeks: 'Messages older than 2 weeks can not be removed.',
  bulk_delete_missing_permissions: 'I do not have permission to delete messages in this channel.',
  bulk_delete_max_100: 'You can only remove less than 100 messages at once.',
  no_images_found: `Couldn't find any images matching that query.`,
  jump_to_moment: 'Jump to moment',
  the_current_prefix_is: 'The current prefix is **{0}**',
  the_current_prefix_for_this_server_is: 'The current prefix for this server is',
  change_prefix_to: 'Change the prefix to **{0}**?',
  prefix_was_changed_to: 'Prefix was changed to **{0}**',
  valid_modules: 'Valid modules',
  available_languages: 'Available languages',
  boop_title: '{0} booped {1}!',
  boop_self: '{0} booped themself',
  boop_chrysalis: '{0} tried to boop Chrysalis',
  hug_title: '{0} hugged {1}',
  hug_self: '{0} hugged themself',
  hug_chrysalis: '{0} tried to hug Chryalis',
  kiss_title: '{0} kissed {1}',
  kiss_self: '{0} kissed themself',
  kiss_chrysalis: '{0} tried to kiss Chrysalis',
  server_info: 'Server info:',
  server_id: 'Server ID',
  server_owner: 'Server owner',
  channels: 'Channels',
  server_boosts: 'Server boosts',
  image_source: 'Image source',
  please_specify_a_new_value: 'Please, specify a new value.',
  value_must_be_true_or_false: 'The value must be **true** or **false**.', // Do NOT translate **true** and **false**
  module_updated: 'Module updated!',
  attachments: 'Attachments',
  message_id: 'Message ID',
  module_enabled: 'Module {0} enabled!',
  module_disabled: 'Module {0} disabled!',
  current_color: 'Current color',
  change_color_to: 'Change color to {0}?',
  invalid_color: 'Invalid color',
  color_was_changed_to: 'Color was changed to {0}',
  usage: 'Usage',
  role_menu: 'Role menu',
  select_the_roles_that_you_want: 'Select the roles that you want',
  you_can_only_add_up_to_25_roles_to_the_menu: 'You can only add up to 25 roles to the menu.',
  manage_roles_permission_required: 'Chrysalis needs the `MANAGE_ROLES` permission for role menus to work.',
  chrysalis_role_too_low: `Chrysalis' role is lower than the role you're requesting. Please, ask an admin to fix it.`,
  roles_managed_by_integrations_cannot_be_manually_assigned: 'Roles managed by integrations cannot be manually assigned.',
  download_emoji: 'Download emoji',
  please_type_a_valid_channel: 'Please, type a valid channel.',
  invalid_channel: 'At least one of the channels you typed is invalid.',
  invite_the_bot: 'Invite the bot',
  website: 'Website',
  support_server: 'Support Server',
  source_code: 'Source code',
  support_the_project: 'Support the project',
  unkown_role: `Couldn't find that role.`,
  role_id: 'Role ID',
  welcome: 'Welcome!',
  you_are_the_member_n: 'You are the member Nº{0}',
  filter_not_found: 'Filter not found. Please, make sure that the filter is public.',
  help_time_out: 'Time to move between pages is over.',
  old_message: 'Old message',
  new_message: 'New message',
  old_attachments: 'Old attachments',
  new_attachments: 'New attachments',
  message_edited: 'Message edited',
  season: 'Season',
  seasons: 'Seasons',
  movies: 'Movies',
  torrent_footer: 'Chrysalis recommends using qBitTorrent, since it is ad-free and open source. Links are provided by yayponies.no /)',
  error_fetching_episodes: 'There was an error fetching the episodes. Please, try again later.',
  attach_files_permission_missing: `Chrysalis doesn't have permission to send images to this channel.`,
  please_type_a_valid_positive_integer: 'Please type a valid positive integer.',
  module_property_not_found: 'Module property not found.',
  levelup: `**Level up!**\nYou're level **{level}** now!`,
  leaderboard_title: 'Leaderboard',
  level: 'Level',
  rank: 'Rank',
  total_xp: 'Total XP',
  profile_fields_title: 'You can change the following:',
  profile_updated: 'Profile updated!',
  unsupported_image_type: 'Unsupported image type.',
  check_documentation: 'Click on the module name to open the documentation for this module.',
  import_levels_from: 'Which bot do you want to import levels from?',
  no_levels_found: 'No levels found from {bot} on this server.',
  mee6_fix: 'Please make sure your MEE6 leaderboard is public by checking [this option](https://mee6.xyz/dashboard/921413532141101077/leaderboard).',
  xp_migration_adapt: 'The way Chrysalis calculates levels may vary from other bots. What do you want to do?',
  import_levels_and_adapt_xp: 'Import levels and adapt XP',
  import_xp_and_adapt_levels: 'Import XP and adapt levels',
  import_leaderboard: 'The leaderboard will now look like this:',
  migration_complete: 'Migration complete!',
  xp_successfully_imported: 'XP has been successfully imported.'
}
