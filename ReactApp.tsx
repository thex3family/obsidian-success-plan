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

    result = array.map((item, index) => <p key={ index } className={'item'} onClick={(event) => showContextMenu(event) }>{ item.name }</p>);

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

  async function getSuccessPlanObjects() {
    let result = [];

    for (let i = 0; i < successPlanItems.length; i++) {
      result.push(await parseFile(successPlanItems[i]));
    }

    setSPObjects(result);
  }

  async function parseFile(file: TFile) { // Will ignore Associations for now
    let result = { 
      name: getItemTitleOnly(file.name),
      share_with_family: '',
      family_connection: '',
      impact: '',
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

    let tagProps = ['Type', 'Status', 'Difficulty', 'Tag', 'Impact'];
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

    return result;
  }

  // `PropertyKey` is short for "string | number | symbol"
  // since an object key can be any of those types, our key can too
  // in TS 3.0+, putting just "string" raises an error
  function hasKey<O>(obj: O, key: keyof any): key is keyof O { // From: https://dev.to/mapleleaf/indexing-objects-in-typescript-1cgi?signin=true
    return key in obj
  }

  function getValueFromTagStr(text: string): any {
    let result: string | number;
    let secondHalf = text.split(':')[1];

    if (secondHalf.includes('/')) {
      result = uppercaseFirstChar(secondHalf.split('/')[1].trim());

      // check if this is for difficulty or for the 25/5 min tag
      if (result.includes('-inc')) {
        result = parseInt(result.split('-inc')[0]);
      } else if (result.includes('-mins')) {
        result = parseInt(result.split('-mins')[0]);
      } else if (result.includes('-')) {
        let resultArray = result.split('-');

        for (let x = 1; x < resultArray.length; x++) {
          resultArray[x] = uppercaseFirstChar(resultArray[x]);
        }
        result = resultArray.join(' ');
      }
    }

    return result;
  }

  function getValueFromUpstreamOrDateStr(text: string): any {
    let result: string | Date;
    let secondHalf = text.split(':')[1];
    
    if (secondHalf.includes('[[')) {
      result = secondHalf.replace('[[', '').replace(']]', '').trim();

      if (text.includes('Date')) {
        result = new Date(result);
      }
    }
    
    return result;
  }

  function uppercaseFirstChar(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function getTasksOfGivenStatus(taskStatus: string) {
    console.log('getTasks');

    let result = [];

    for (let i = 0; i < successPlanObjects.length; i++) {
      console.log(successPlanObjects[i]);

      if (successPlanObjects[i].type == 'Task' && successPlanObjects[i].status == taskStatus) {
        result.push(successPlanObjects[i]);
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
    if (!successPlanItems) { // The if statement needs to be used unless I want setState to be called on every rerender (causing that maxiumum update depth error & infinite loop)
      getSuccessPlanItems(); 
    }
    if (successPlanItems && !successPlanObjects) {
      getSuccessPlanObjects();
    }
  });

  return (
    <>
      { successPlanObjects ?
        <>
          <h3>Ready to Complete</h3>
          { generateList(getTasksOfGivenStatus('Ready To Complete')) }
          <h3>In Progress</h3>
          { generateList(getTasksOfGivenStatus('In Progress')) }
          <h3>Complete</h3>
          { generateList(getTasksOfGivenStatus('Complete')) }
        </> : null
      }
    </>
  );
};