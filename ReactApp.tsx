import * as React from "react";
import { useApp } from "./hooks";
import { useState, useEffect } from 'react';
import { Menu, Notice } from 'obsidian';

export default function ReactApp() {
  const { vault } = useApp(); // hook that gives us access to the Obsidian app object (ex. <h4>{vault.getName()}</h4>)
  const [ successPlanItems, setSPItems ] = useState(null);

  function generateList(array: any[]) {
    let result = [];

    result = array.map((item, index) => <p key={ index } className={'item'} onClick={(event) => showContextMenu(event) }>{ getItemTitleOnly(item.name) }</p>);

    return result;
  }

  function getMarkdownFiles() {
    const files = vault.getMarkdownFiles();

    for (let i = 0; i < files.length; i++) {
      console.log(files[i].path);
    }
  }

  function getSuccessPlanItems() {
    let result = [];

    const files = vault.getMarkdownFiles();
    
    for (let i = 0; i < files.length; i++) {
      let startOfFileName = files[i].name.split('-')[0];
      
      if (startOfFileName.startsWith('Goal') || startOfFileName.startsWith('Key Result') || startOfFileName.startsWith('Project') || startOfFileName.startsWith('Task')) {
        result.push(files[i]);
      }
    }

    /*
    for (let i = 0; i < result.length; i++) {
      console.log(result[i].name);
    }
    */

    setSPItems(result);
  }

  function getTasks() {
    let result = [];

    for (let i = 0; i < successPlanItems.length; i++) {
      if (successPlanItems[i].name.startsWith('Task')) {
        result.push(successPlanItems[i]);
      }
    }

    return result;
  }

  function getItemTitleOnly(name: string) {
    return name.split('-')[1].trim().replace('.md', '');
  }

  function showContextMenu(event: any) {
    const menu = new Menu(this.app);

      menu.addItem((item) =>
        item
          .setTitle("Copy")
          .setIcon("documents")
          .onClick(() => {
            new Notice("Copied");
          })
      );

      menu.addItem((item) =>
        item
          .setTitle("Paste")
          .setIcon("paste")
          .onClick(() => {
            new Notice("Pasted");
          })
      );

      menu.showAtMouseEvent(event);
  }

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    if (!successPlanItems) { // The if statement needs to be used unless you want setState to be called on every rerender (causing that maxiumum update depth error & infinite loop)
      getSuccessPlanItems(); 
    }
  });

  return (
    <>
      { successPlanItems ? 
        <>
          <h3>Ready to Complete</h3>
          { generateList(getTasks()) }
          <h3>In Progress</h3>
          { generateList(getTasks()) }
          <h3>Complete</h3>
          { generateList(getTasks()) }
        </> : null
      }
    </>
  );
};