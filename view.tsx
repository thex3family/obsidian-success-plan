import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactApp from "./ReactApp";
import { AppContext } from "./context";

export const VIEW_TYPE_SUCCESS_PLAN = "success-plan-view";

export class SuccessPlanView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_SUCCESS_PLAN;
  }

  getDisplayText() {
    return "Success Plan";
  }

  async onOpen() {
    /* // For Non-React Elements
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Example view" });

    const book = container.createEl("div", { cls: "book" });
    book.createEl("div", { text: "How to Take Smart Notes", cls: "book__title" });
    book.createEl("small", { text: "Sönke Ahrens", cls: "book__author" });
    */

    /*
    ReactDOM.render(
        <ReactView />,
        this.containerEl.children[1]
    );
    */
    
    ReactDOM.render(
        <AppContext.Provider value={this.app}>
          <ReactApp />
        </AppContext.Provider>,
        this.containerEl.children[1]
    );
  }

  async onClose() {
    ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
  }
}