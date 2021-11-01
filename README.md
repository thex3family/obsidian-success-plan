## Success Plan for Obsidian

![Preview](https://github.com/joshwingreene/obsidian-success-plan/blob/main/assets/obsidian-success-plan-preview.png)

> This plugin was developed by [Joshwin Greene](https://github.com/joshwingreene) in collaboration with [Conrad Lin](https://conradlin.com/) (Designer of the Success Plan Framework) and the [Co-x3 Family](https://join.co-x3.com/). If you would like to show Joshwin your appreciation, you can do so by buying him a [coffee](https://ko-fi.com/joshwingreene). If you are a fan of what Conrad, Joshwin, and the rest of the Co-x3 Family are doing, please support us by becoming a one-time or monthly [Patron](https://toolbox.co-x3.com/support-us). Also, if you are interested in being a part of a community of co-creators and collaborators, then we would be happy to have you. [Learn More](https://join.co-x3.com/community).

This plugin offers capabilities that follow #theGamificationProject's Success Plan by Conrad Lin.

It allows you to manage your tasks, projects, key results, and goals within Obsidian. You can also push your wins to the [Make Work Fun](https://www.producthunt.com/posts/make-work-fun-gamify-notion-workspaces) app, which is the Co-x3 Family's solution to multiplayer for personal development. We recently open-sourced the [code](https://github.com/thex3family/make-work-fun) (with limitations)!

This plugin relies on markdown files that have the following format:

![Markdown Preview](https://github.com/joshwingreene/obsidian-success-plan/blob/main/assets/task-markdown-preview.png)

You can share wins with the Co-x3 Family by changing an item's status to "Complete" and choosing the "Share with Family" option. When this is done, it will be pushed to Make Work Fun over a series of steps. Here's a diagram on how it gets from Obsidian to Make Work Fun:

![Share with Family Flow](https://github.com/joshwingreene/obsidian-success-plan/blob/main/assets/share-with-family-diagram.png)

After you have shared the win, you will see the win in the "Recent Wins" table on your player page. Here's an example:

![player page](https://github.com/joshwingreene/obsidian-success-plan/blob/main/assets/obsidian-to-make-work-fun.png)

## Getting Started (After it is accepted to Obsidian's Community of Plugins)

1. Install the plugin by going to the Communtiy Plugins area in Obsidian

2. Create a Success Plan directory in your vault and create subfolders for each type of item ([Read the directory section of this file](https://github.com/joshwingreene/obsidian-success-plan/blob/main/assets/success-plan-dir-struc-and-tags.md))

3. Add the above file to your vault so you get access to the tags

4. Open the plugin's pane/view by clicking on its icon on the left hand bar/ribbon

(**Follow the following steps if you wish to push your wins to Make Work Fun)**

1. Create an account on [Make Work Fun](https://www.makework.fun/) if you don't already have one. Created a database using either the FREE [Gamify your Life](https://www.producthunt.com/posts/gamify-your-life) package or a custom-made database that is [in line](https://academy.co-x3.com/en/articles/5619383-how-to-connect-any-notion-database-to-the-app) with the Make Work Fun / Co-x3 Family Connection app.

3. Create a a Notion integration for this plugin ([Read Steps 1 and 2](https://developers.notion.com/docs/getting-started))

2. Enter the Notion integration key to the "Notion Integration Key" text box on the Settings tab for this plugin 

3. Enter the database id to the "Notion Database ID" text box on the Settings tab for this plugin

## Known Bugs

I know of a couple of bugs. So, YMMV. However, just don’t use apostrophes or dashes in the title. I’ll be dealing with that issue soon. It won’t crash the app or anything based on what I have experienced.

## Features

- List and Show/Hide Success Plan items that can be found in the Success Plan directory: ![Success](https://img.shields.io/badge/-success-brightgreen)
- Easily change the status of Success Plan items by clicking and selecting the new status (ex. In Progress) ![Success](https://img.shields.io/badge/-success-brightgreen)
- Create Success Plan items using the floating action button to the bottom right: ![Success](https://img.shields.io/badge/-success-brightgreen)
- Edit Success Plan Items by clicking an item and clicking on "Edit" : ![Success](https://img.shields.io/badge/-success-brightgreen)
- Push wins to Make Work Fun (very basic at the moment): ![Success](https://img.shields.io/badge/-success-brightgreen)

## Coming Soon

- Fully map completed success items that are shared to the Co-x3 Family with the structure defined by Make Work Fun (ex. recognize the item type)
- Be able to select upstream and downstream items when creating and editing items via the modal
- Be able to turn gamification off. So, instead of being able to see the gold that you will get for completing a task, you will see the estimated number of pomodoros based on the difficulty that you choose.
- Be able to turn the Share With Family functionality off. At the moment, you can ignore the Share with Family functionality by not using the Share with Family context menu option or the toggle in the modal. If you follow these instructions, then the plugin won't attempt to push your win to Make Work Fun.

## Want to Help?

Join the Co-x3 Family! I'm one of the two co-leaders of the Artificer (Programmer) faction and I'm leading the official guild project that was created for this plugin. So, I and the Co-x3 Family would be happy to have you. Learn more about joining [here](https://join.co-x3.com/apply).
