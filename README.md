Gymotheé is a multi-purpose [Discord](https://discord.com) bot. [Click here](https://discord.com/api/oauth2/authorize?client_id=752210634858561646&permissions=8&scope=bot) to add Gymotheé to your server!

To use Gymotheé, you must enter commands. See the list of commands below to get started.

# Commands

## Setup Commands
These commands are generally "one-time use" for setting up the bot for your server.

`!setprefix [prefix]`

Set a new command prefix to replace `!`.

`!setcommandchannel`

Use this command to set which channel you will use to send commands to the bot. Type this command in the desired channel for it to work. When no command channel is set, commands will work everywhere.

`!unsetcommandchannel`

Un-sets the command channel (see previous entry).

`!logmode [on/off]`

Turn voice logging on or off, or when used with no parameters, view the current log mode. When voice logging is on, the bot will send a message in the text area of voice channels when a user leaves or joins.

`!namedisplay [option]`

Controls how usernames will be displayed for voice logs. `[option]` can be `username`, `nickname`, or `id`. `username` will use users' unique usernames. `nickname` will use users' chosen nicknames for the server. If a user doesn't have one, it will use their display name (not unique). `id` will use users' unique user IDs assigned by Discord (just a bunch of numbers).

`!setwelcomechannel`

Designates the channel where the command is posted as the welcome channel, which is where the welcome message will be posted when a new user joins.

`!setwelcomemessage [message]`

Sets a welcome message which is posted when a new user joins the server. Use `<@mention>` to have Gymotheé mention the person who just joined.

`!unsetwelcomemessage`

Removes any welcome message which is set (see previous entry) so that no message is sent when a new user joins.

`!setrulesmessage`

**Must be a reply to another message.**

Designate a message as the message containing your server's rules.  The bot will then post a message asking you to react to the message it just sent with the emoji users will use to agree to the rules. After doing this, users will be given the role `rule agreers` when they react to the rules message with your designated agreement emoji. If they remove their reaction, the role will be removed.

**Before using, be sure to:**

1. Write a rules message
2. Create a role named `rule agreers`
3. Ensure Gymotheé has a role with higher priority than the `rule agreers` role. Otherwise the bot will not have permission to assign the role.
4. Update channel access based on `rule agreers` role.

`!commandsecurity [on/off]`

Turn commmand security on or off (it is off by default). Turning command security on prevents anyone from using these setup commands unless they have the role `gymothee admin`. Using this command without parameters provides the current setting.

## General Commands

These are general, straightforward commands.

`!flip`

Flip a coin. returns "heads" or "tails."

`!roll [#sides] [#sides] [#sides]...`

Example: `!roll 6 6`

Roll some number of dice. Each die you roll, separated by spaces, is represented by a number which designates the number of sides of that die.

`!help`

Provides a link to this repository!

## Reminder Commands

Commands for creating and managing reminders. Disclaimer: all reminders are currently based on EST/EDT (New York time zone).

`!remind`

Creates a new reminder. You can simply set a reminder which will remind you on/at a certain date/time, after/in some duration/amount of time, or you can create a "custom" reminder by specifying each parameter individually.

### At a date/time, or on a date (like an alarm):

`!remind [at/on] [date OR time] [date OR time (opt)] [message (opt)] [recipients (opt)]`

Examples:

`!remind on 9/5/22 8:00am Happy birthday Dan! @Dan1234`

`!remind at 12:30pm Lunch time`

### After a certain amount of time (like a timer):

`!remind [after/in] [duration] [message (opt)] [recipients (opt)]`

Examples:

`!remind after 12:00 Pasta is ready`

`!remind in 2 days, 6 hours, 5 min Wake up from nap`

### Custom:

`!remind custom [parameters]`

Examples:

`!remind custom date="1/2/23 12:00"; message="Hello"; repeat="4 year"; whom="Dan1234, Lisa6789"; deliver="dm"`

`!remind custom date="22:00 10/6/23"; repeat="weekdays Fri,Sat"`


#### Custom Reminder Syntax:

Each parameter you include should be formatted like this: `param="value";` (except the last parameter shouldn’t have a semicolon).

`[date]`: The date (including the time) that the reminder will be sent. Format it like: `HH:MM MM/DD/YY` using military time for best results.

`[message]`: The message that will be sent as the reminder.

`[repeat]`: Defines if/how the reminder will renew itself after it is sent. Set it to "false" to disable repeating, or to enable repeating, use `[number] [time unit]` to make the reminder repeat every `[number] [time unit]`. For example, `repeat="2 week"` would result in a reminder which is sent every 2 weeks.

`[deliver]`: Determines whether the reminder will be delivered in a public text channel or via DM. Can be set to `dm` or `pub`.

`[whom]`: Determines the recipients of the reminder. Recipients you list should be separated by commas and can be specified by user id or username.

### Defaults for optional parameters (all methods):

`[time]`: Midnight

`[date]`: The current date

`[message]`: "Reminder!"

`[recipients]`: The creator of the reminder

`[repeat]`: false

`[deliver]`: Matches how the reminder was created

### Other reminder commands

`!viewremind [id/all]`

View details for a reminder by inputting the reminder `[id]`. You can view all reminders that will be sent to you and that you have created by inputting `all` in place of the `[id]`.

`!editremind [id] [parameters]`

Edit a reminder by specifying the parameters using the same syntax as a custom reminder. You only need to specify the parameters you want to change.

`!cancelremind [id]`

Delete a reminder that you have created or opt out of a reminder for which you are a recipient. If you opt out and the reminder has no one left to remind, it will be deleted.