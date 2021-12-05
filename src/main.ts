import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { SuccessPlanView, VIEW_TYPE_SUCCESS_PLAN } from "./view";

interface SuccessPlanPluginSettings {
	//notionIntegrationKey: string; // make work fun
	//notionDatabaseID: string; // make work fun
	isGamificationOn: boolean;
	dateFormat: string;
}

const DEFAULT_SETTINGS: SuccessPlanPluginSettings = {
	//notionIntegrationKey: '', // make work fun
	//notionDatabaseID: '', // make work fun
	isGamificationOn: true,
	dateFormat: 'MM-DD-YYYY'

}

export default class SuccessPlanPlugin extends Plugin {
	settings: SuccessPlanPluginSettings;
	isMounted: boolean;

	async onload() {
		this.isMounted = true;

		//console.log('onload');

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
		//console.log("unload");
		this.isMounted = false;

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

		/* Will turn back on when the Make Work Fun stuff is finished and turned back on
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
		*/

		new Setting(containerEl)
		.setName('Gamification')
		.setDesc('If disabled, this will cause the total gold for tasks to be hidden.')
		.addToggle(cb => cb
			.setValue(this.plugin.settings.isGamificationOn)
			.onChange(async (value) => {
				this.plugin.settings.isGamificationOn = value;
				await this.plugin.saveSettings();
				await this.plugin.onunload();
				new Notice('Please restart plugin.');
			}));

		new Setting(containerEl)
		.setName('Date Format')
		.setDesc('Use the date format that you use for your daily notes, ex. MM DD YYYY')
		.addText(text => text
			.setPlaceholder('Date Format')
			.setValue(this.plugin.settings.dateFormat)
			.onChange(async (value) => {
				this.plugin.settings.dateFormat = value;
				await this.plugin.saveSettings();
				if (this.plugin.isMounted) {
					await this.plugin.onunload();
					//console.log('Is Plugin Mounted:', this.plugin.isMounted);
					new Notice('Please restart plugin.');
				}
			}));
	}
}
