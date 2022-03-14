import { App, Modal, Setting, Notice, moment } from "obsidian";
import { uppercaseFirstChar, uppercaseFirstCharOverMultipleWordsWithReplaceSeparator } from "src/utility";

export class ItemModal extends Modal {

  onSubmit: (result: any) => void;
  successPlanItem: any;
  action: string;
  isValidName: boolean;
  dateFormat: string;
  originalName: boolean;
  successPlanItems: any;

  constructor(app: App, dateFormat: string, successPlanItems: any, action: string, successPlanItem: any, onSubmit: (result: any) => void) {
    super(app);
    this.onSubmit = onSubmit;
    this.successPlanItem = successPlanItem;
    this.successPlanItems = successPlanItems;
    this.action = action;
    this.isValidName = this.checkIfNameisValid(successPlanItem.name);
    this.dateFormat = dateFormat ? dateFormat : 'MM-DD-YYYY';
    this.originalName = successPlanItem.name;

    //console.log('constructor');
    //console.log('successPlanItem:', successPlanItem);
  }

  getErrorMessage() {
    return this.isValidName ? "" : "This is an invalid name. Name's can't include /, \\, :, or .";
  }


  onLoadbyType() {
    let upstreamitems = [];
    let downstreamitems = [];

    for (let i of this.successPlanItems){
        if (this.successPlanItem.type == 'Task'){ (i.name.includes('Project')) ? upstreamitems.push(i.name) : ''; }
        else if (this.successPlanItem.type == 'Project'){
            (i.name.includes('Key Result')) ? upstreamitems.push(i.name) : (i.name.includes('Task')) ? downstreamitems.push(i.name) : '';
        }
        else if (this.successPlanItem.type == 'Key Result'){
            (i.name.includes('Goal')) ? upstreamitems.push(i.name) : (i.name.includes('Project')) ? downstreamitems.push(i.name) : '';
        }
        else if (this.successPlanItem.type == 'Goal'){ (i.name.includes('Key Result')) ? downstreamitems.push(i.name) : ''; }
    }
    return [upstreamitems, downstreamitems];
  }

  onOpen() {
    let [upstream, downstream] = this.onLoadbyType();
    let { contentEl } = this;
    contentEl.createEl("h3", { text: this.action == 'EDIT' ? "Edit Item" : "Create Item", cls: "center_flex" });
    contentEl.createEl("p", { text: this.getErrorMessage(), cls: ["center_flex", "error_msg"] });

    new Setting(contentEl)
      .setName("Name")
      .addText((text) =>
        text.setValue(this.successPlanItem.name ? this.successPlanItem.name : "").onChange((value) => {
          this.successPlanItem.name = value;
          this.isValidName = this.checkIfNameisValid(value);
          let el = contentEl.querySelector(".error_msg");
          el.setText(this.getErrorMessage());

          let btn = contentEl.querySelector(".modal_submit_btn");
          if (this.isValidName) {
            btn.removeClass("modal_disabled_submit_btn");
          } else {            
            btn.addClass("modal_disabled_submit_btn");
          }
        }));

    new Setting(contentEl)
    .setName("Description")
    .addText((text) =>
        text.setValue(this.successPlanItem.description ? this.successPlanItem.description : "").onChange((value) => {
        this.successPlanItem.description = value;
        }));

    /* // Related to Make Work Fun
    new Setting(contentEl)
    .setName("Share with Family")
    .addToggle((toggleValue) =>
        toggleValue.setValue(this.successPlanItem.share_with_family === 'true').onChange((value) => {
            this.successPlanItem.share_with_family = value.toString()
        }));
    */

    new Setting(contentEl)
    .setName("Type")
    .addDropdown((cb) =>
        cb
            .addOptions({ task: "Task", project: "Project", key_result: "Key Result", goal: 'Goal' })
            .setValue(this.successPlanItem.type ? this.successPlanItem.type.toLowerCase().replace(' ', '_') : "")
            .onChange(async (val) => {
                this.successPlanItem.type = val.includes('_') ? "Key Result" : uppercaseFirstChar(val)
            })
        );

    new Setting(contentEl)
    .setName("Impact")
    .addDropdown((cb) =>
        cb
          .addOptions({ low: "Low", s_low: "S-Low", medium: "Medium", s_high: "S-High", high: 'High' })
          .setValue(this.successPlanItem.impact ? this.successPlanItem.impact.toLowerCase().replaceAll(' ', '_') : "")
          .onChange(async (val) => {
            this.successPlanItem.impact = val.includes('_') ? uppercaseFirstCharOverMultipleWordsWithReplaceSeparator(val, '_', ' ') : uppercaseFirstChar(val)
          })
      );

    new Setting(contentEl)
    .setName("Status")
    .addDropdown((cb) =>
        cb
        .addOptions({ ready_to_start: "Ready to Start", next_up: "Next Up", in_progress: "In Progress", complete: 'Complete', backlog: "Backlog", canceled: "Canceled" })
        .setValue(this.successPlanItem.status ? this.successPlanItem.status.toLowerCase().replaceAll(' ', '_') : "")
        .onChange(async (val) => {
            this.successPlanItem.status = val.includes('_') ? uppercaseFirstCharOverMultipleWordsWithReplaceSeparator(val, '_', ' ') : uppercaseFirstChar(val)
        })
    );

    if (this.successPlanItem.type == "Task") {
        new Setting(contentEl)
        .setName("Difficulty")
        .addSlider((cb) =>
            cb
            .setLimits(1, 10, 1)
            .setValue(this.successPlanItem.difficulty ? this.successPlanItem.difficulty : null)
            .onChange(async (val) => {
                this.successPlanItem.difficulty = val
            })
            .setDynamicTooltip()
        );
    }

    // Do Date Setting 
    const doDate_setting_item = contentEl.createEl("div", {cls: "setting-item"});
    const doDate_setting_item_info = contentEl.createEl("div", {cls: "setting-item-info"});
    doDate_setting_item_info.append(contentEl.createEl("div", { text: 'Do Date', cls: "setting-item-name"}));
    const doDate_setting_item_control = contentEl.createEl("div", {cls: "setting-item-control"});
    const doDate_picker = contentEl.createEl("input", {type: "text", value: this.successPlanItem.do_date != "" ? this.successPlanItem.do_date._i : ""  });
    doDate_picker.onfocus = () => {doDate_picker.type = 'date'; doDate_picker.className="dropdown"; doDate_picker.value = this.successPlanItem.do_date.format("YYYY-MM-DD");};
    doDate_picker.onchange = async (event) => {this.successPlanItem.do_date = moment(event.target.value)};
    doDate_picker.onblur = () => {doDate_picker.type = 'text'; doDate_picker.value = this.successPlanItem.do_date.format(this.dateFormat)};
    doDate_setting_item_control.append(doDate_picker);
    doDate_setting_item.append(doDate_setting_item_info);
    doDate_setting_item.append(doDate_setting_item_control);

    // Due Date Setting 
    const dueDate_setting_item = contentEl.createEl("div", {cls: "setting-item"});
    const dueDate_setting_item_info = contentEl.createEl("div", {cls: "setting-item-info"});
    dueDate_setting_item_info.append(contentEl.createEl("div", { text: 'Due Date', cls: "setting-item-name"}));
    const dueDate_setting_item_control = contentEl.createEl("div", {cls: "setting-item-control"});
    const dueDate_picker = contentEl.createEl("input", {type: "text", value: this.successPlanItem.due_date != "" ? this.successPlanItem.due_date._i : ""  });
    dueDate_picker.onfocus = () => {dueDate_picker.type = 'date'; dueDate_picker.className="dropdown"; dueDate_picker.value = this.successPlanItem.due_date.format("YYYY-MM-DD");};
    dueDate_picker.onchange = async (event) => {this.successPlanItem.due_date = moment(event.target.value)};
    dueDate_picker.onblur = () => {dueDate_picker.type = 'text'; dueDate_picker.value = this.successPlanItem.due_date.format(this.dateFormat)};
    dueDate_setting_item_control.append(dueDate_picker);
    dueDate_setting_item.append(dueDate_setting_item_info);
    dueDate_setting_item.append(dueDate_setting_item_control);

    // Closing Date Setting
    const closingDate_setting_item = contentEl.createEl("div", {cls: "setting-item"});
    const closingDate_setting_item_info = contentEl.createEl("div", {cls: "setting-item-info"});
    closingDate_setting_item_info.append(contentEl.createEl("div", { text: 'Closing Date', cls: "setting-item-name"}));
    const closingDate_setting_item_control = contentEl.createEl("div", {cls: "setting-item-control"});
    const closingDate_picker = contentEl.createEl("input", {type: "text", value: this.successPlanItem.closing_date != "" ? this.successPlanItem.closing_date._i : ""  });
    closingDate_picker.onfocus = () => {closingDate_picker.type = 'date'; closingDate_picker.className="dropdown"; closingDate_picker.value = this.successPlanItem.closing_date.format("YYYY-MM-DD");};
    closingDate_picker.onchange = async (event) => {this.successPlanItem.closing_date = moment(event.target.value)};
    closingDate_picker.onblur = () => {closingDate_picker.type = 'text'; closingDate_picker.value = this.successPlanItem.closing_date.format(this.dateFormat)};
    closingDate_setting_item_control.append(closingDate_picker);
    closingDate_setting_item.append(closingDate_setting_item_info);
    closingDate_setting_item.append(closingDate_setting_item_control);

    new Setting(contentEl)
    .setName("Upstream")
    .setClass("updown-stream-setting")
    .setDesc("Ctrl/Command + Click to select multiple options")
    .addDropdown((cb) =>
        cb
        .addOptions(upstream) 
        .setValue(this.successPlanItem.upstream != "" ? this.successPlanItem.upstream : "") 
        .onChange(async (val) => {
            let values = Array.from(cb.selectEl.selectedOptions).map(value => value.text);
            let upstreamString = '', value;
            while(values.length > 0){
                value = values.shift();
                (values.length < 1 ) ? upstreamString += '[[' + value + ']]' : upstreamString += '[[' + value + ']],';
            }
            this.successPlanItem.upstream = upstreamString
        })
        .selectEl.multiple = true
    );

    new Setting(contentEl)
    .setName("Downstream")
    .setClass("updown-stream-setting")
    .setDesc("Ctrl/Command + Click to select multiple options")
    .addDropdown((cb) =>
        cb
        .addOptions(downstream) 
        .setValue(this.successPlanItem.downstream != "" ? this.successPlanItem.downstream : "") 
        .onChange(async (val) => {
            let values = Array.from(cb.selectEl.selectedOptions).map(value => value.text);
            let downstreamString = '', value;
            while(values.length > 0){
                value = values.shift();
                (values.length < 1 ) ? downstreamString += '[[' + value + ']]' : downstreamString += '[[' + value + ']],';
            }
            this.successPlanItem.downstream = downstreamString;
        })
        .selectEl.multiple = true
    );

    if (this.successPlanItem.type == "Task") {
        new Setting(contentEl)
        .setName("Tag (Mins Per Pomodoro)")
        .addDropdown((cb) =>
            cb
            .addOptions({ 25: "25 mins", 5: "5 Mins" }) 
            .setValue(this.successPlanItem.tag != "" ? this.successPlanItem.tag : "")
            .onChange(async (val) => {
                this.successPlanItem.tag = parseInt(val)
            })
        );
    }

    new Setting(contentEl)
    .setName("Area (Goals Only)")
    .addDropdown((cb) =>
        cb
            .addOptions({ career: "Career", 
                          family: "Family", 
                          finances: "Finances", 
                          health: 'Health', 
                          knowledge: 'Knowledge',
                          lifestyle: 'Lifestyle',
                          mindsets: 'Mindsets', // Intentionally making this Plural for MOCs
                          sharing: 'Sharing',
                          sustainable_business: 'Sustainable Business',
                          travel: 'Travel'
                         })
            .setValue(this.successPlanItem.area ? this.successPlanItem.area.toLowerCase().replace(' ', '_') : "")
            .onChange(async (val) => {
                this.successPlanItem.area = val.includes('_') ? uppercaseFirstCharOverMultipleWordsWithReplaceSeparator(val, '_', ' ') : uppercaseFirstChar(val)
            })
        );

    /* Temporarily removing this since the note-editing experience isn't great at the moment
    new Setting(contentEl)
    .setName("Notes")
    .addTextArea((cb) =>
        cb 
        .setValue(this.successPlanItem.note_content ? this.successPlanItem.note_content.trim() : "")
        .onChange(async (val) => {
            this.successPlanItem.note_content = val
        })
    );
    */

    new Setting(contentEl)
    .addButton((btn) =>
        btn
        .setClass("modal_submit_btn")
        .setButtonText(this.action == "EDIT" ? "UPDATE" : "Create")
        .setCta()
        .onClick(() => {
            if (this.isValidName) {
                if (this.action == "EDIT" && this.successPlanItem.name != this.originalName) {
                    this.onSubmit({ ...this.successPlanItem, name_was_edited: true }); // TODO: Refine the outputs so they are consistent with how the inner workings work (ex. type's first character is uppercase)
                } else {
                    this.onSubmit(this.successPlanItem); // TODO: Refine the outputs so they are consistent with how the inner workings work (ex. type's first character is uppercase)
                }
                this.close();
            } else {
                new Notice("Invalid Name. Please choose a different name.");
            }
        }));
  }

  checkIfNameisValid(name: string): boolean {
      return name.match(/[/\\:.]/g) == null ? true : false;
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}