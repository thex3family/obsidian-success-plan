import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactApp from "./ReactApp";
import { AppContext } from "./context";
import SuccessPlanPlugin from "./main";

export const VIEW_TYPE_SUCCESS_PLAN = "success-plan-view";

export class SuccessPlanView extends ItemView {
  plugin: SuccessPlanPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: SuccessPlanPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE_SUCCESS_PLAN;
  }

  getDisplayText() {
    return "Success Plan";
  }

  async onOpen() {  
    ReactDOM.render(
        <AppContext.Provider value={this.app}>
          <ReactApp settings={this.plugin.settings}/>
        </AppContext.Provider>,
        this.containerEl.children[1]
    );
  }

  async onClose() {
    ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
  }
}