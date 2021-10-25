import * as React from "react";
import { useApp } from "./hooks";
import { useState, useEffect } from 'react';
import { Menu, Notice, TFile } from 'obsidian';

export default function ReactApp() {
  const { vault } = useApp(); // hook that gives us access to the Obsidian app object (ex. <h4>{vault.getName()}</h4>)
  const [ successPlanItems, setSPItems ] = useState(null);
  const [ successPlanObjects, setSPObjects ] = useState(null);

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

  async function getSuccessPlanObjects() { // TODO: Place this after the other success plan method in useEffect
    let result = [];

    for (let i = 0; i < successPlanItems.length; i++) {
      parseFile(successPlanItems[i]);
    }
  }

  async function parseFile(file: TFile) { // Will ignore Associations for now
    let result = { 
      name: getItemTitleOnly(file.name), 
      share_with_family: '',
      family_connection: '',
      type: '',
      status: '',
      difficulty: '',
      do_date: '',
      due_date: '',
      closing_date: '',
      area: '',
      upstream: '',
      tag: '',
      content: ''
     };
    
    let itemContent = await vault.cachedRead(file);

    console.log(file.name);

    // split using '---' (use the first element to get the value of the other properties besides content)
    let contentArray = itemContent.split('---');
    let propertyContent = contentArray[0];
    let nonPropertyContent = contentArray[1];

    // split the property content using carriage return ('\n') - assuming this gives me what I want
    //console.log('*** Property Content ***');
    //console.log(propertyContent);

    let propertyContentArray = propertyContent.split('\n');

    let tagProps = ['Type', 'Status', 'Difficulty', 'Tag'];
    let upstreamAndDateProps = ['Upstream', 'Do Date', 'Due Date', 'Closing Date'];

    // check what the string starts with (only difference: upstream/dates vs everything else) - dif: page vs tag
    for (let i = 0; i < propertyContentArray.length; i++) {
      //console.log(i, propertyContentArray[i]);

      for (let k = 0; k < tagProps.length; k++) {
        if (propertyContentArray[i].startsWith(tagProps[k])) {
          //console.log('Starts with a tagProp');
          //console.log('Starts with a tag');
          let key = tagProps[k].toLowerCase();
          //console.log('lowercase key:', key);
          if (hasKey(result, key)) {
            //console.log('hasKey called');
            //console.log('key:', key); // Issue: This is only working for the type
            result[key] = getValueFromTagStr(propertyContentArray[i]);
          } 
        }
      }

      for (let j = 0; j < upstreamAndDateProps.length; j++) {
        if (propertyContentArray[i].startsWith(upstreamAndDateProps[j])) {
          //console.log('Starts with a upstreamAndDateProp');
          let key = upstreamAndDateProps[j].toLowerCase();
          if (key.includes(' ')) {
            key = key.replace(' ', '_');
          }
          //console.log('lowercase key:', key);
          if (hasKey(result, key)) {
            result[key] = getValueFromUpstreamOrDateStr(propertyContentArray[i]);
          }
        }   
      }
    }

    //console.log('*** Non-Property Content ***');
    //console.log(nonPropertyContent);

    result.content = nonPropertyContent;

    console.log('result:', result);

  }

  // `PropertyKey` is short for "string | number | symbol"
  // since an object key can be any of those types, our key can too
  // in TS 3.0+, putting just "string" raises an error
  function hasKey<O>(obj: O, key: keyof any): key is keyof O { // From: https://dev.to/mapleleaf/indexing-objects-in-typescript-1cgi?signin=true
    return key in obj
  }

  function getValueFromTagStr(text: string): string {
    let result = '';
    let secondHalf = text.split(':')[1];

    if (secondHalf.includes('/')) {
      result = uppercaseFirstChar(secondHalf.split('/')[1]);
    }

    return result.trim();
  }

  function getValueFromUpstreamOrDateStr(text: string): string {
    let result = '';
    let secondHalf = text.split(':')[1];
    
    if (secondHalf.includes('[[')) {
      result = secondHalf.replace('[[', '').replace(']]', '');
    }
    
    return result.trim();
  }

  function uppercaseFirstChar(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
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
    if (successPlanItems && !successPlanObjects) {
      getSuccessPlanObjects();
    }
  });

  return (
    <>
      { successPlanItems ? // TODO: Change to the objects
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