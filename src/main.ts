import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { SuccessPlanView, VIEW_TYPE_SUCCESS_PLAN } from "./view";

interface SuccessPlanPluginSettings {
	notionIntegrationKey: string;
	notionDatabaseID: string;
	isGamificationOn: boolean;
}

const DEFAULT_SETTINGS: SuccessPlanPluginSettings = {
	notionIntegrationKey: '',
	notionDatabaseID: '',
	isGamificationOn: true
}

export default class SuccessPlanPlugin extends Plugin {
	settings: SuccessPlanPluginSettings;

	async onload() {
		console.log('onload');

		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_SUCCESS_PLAN,
			(leaf) => new SuccessPlanView(leaf, this)
		  );

		// This creates an icon in the left ribbon.
		let ribbonIconEl = this.addRibbonIcon('navigate-glyph', 'Success Plan Plugin', (evt: MouseEvent) => { // TODO: Find a relevant icon
			this.activateView();
		});
		// Perform additional things with the ribbon
		//ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SuccessPlanSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_SUCCESS_PLAN);
	
		await this.app.workspace.getLeaf(true).setViewState({
		  type: VIEW_TYPE_SUCCESS_PLAN,
		  active: true,
		});
	
		this.app.workspace.revealLeaf(
		  this.app.workspace.getLeavesOfType(VIEW_TYPE_SUCCESS_PLAN)[0]
		);
	  }

	onunload() {
		console.log("unload");

		this.app.workspace.detachLeavesOfType(VIEW_TYPE_SUCCESS_PLAN);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SuccessPlanSettingTab extends PluginSettingTab {
	plugin: SuccessPlanPlugin;

	constructor(app: App, plugin: SuccessPlanPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h3', {text: 'General Settings'});

		new Setting(containerEl)
			.setName('Notion Integration Key')
			.setDesc('This is used to push wins that you wish to share with the Co-x3 community to a Notion database that you own so that it is posted to Make Work Fun.')
			.addText(text => text
				.setPlaceholder('Enter your secret key')
				.setValue(this.plugin.settings.notionIntegrationKey)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.notionIntegrationKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
		.setName('Notion Database ID')
		.setDesc('Get this by copying the URL of your Notion database. If you are using an inline database, make sure that you are viewing the database as a full page. If you are on Desktop, click on "Share" and then "Copy Link"')
		.addText(text => text
			.setPlaceholder('Notion database ID')
			.setValue(this.plugin.settings.notionDatabaseID)
			.onChange(async (value) => {
				console.log('Secret: ' + value);
				this.plugin.settings.notionDatabaseID = value;
				await this.plugin.saveSettings();
			}));

		/* // Finish setting up when I take care of some more important tasks
		new Setting(containerEl)
		.setName('Gamification')
		.setDesc('If disabled, this will cause the total goal for tasks to change to the estimated number of Pomodoros.')
		.addToggle(cb => cb
			.setValue(this.plugin.settings.isGamificationOn)
			.onChange(async (value) => {
				console.log('New Value: ' + value);
				this.plugin.settings.isGamificationOn = value;
				await this.plugin.saveSettings();
			}));
		*/
	}
}
