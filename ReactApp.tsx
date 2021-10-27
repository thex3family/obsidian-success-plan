import * as React from "react";
import { useApp } from "./hooks";
import { useState, useEffect } from 'react';
import { Menu, Notice, TFile } from 'obsidian';

export default function ReactApp() {
  const { vault } = useApp(); // hook that gives us access to the Obsidian app object (ex. <h4>{vault.getName()}</h4>)
  const [ successPlanItems, setSPItems ] = useState(null);
  const [ successPlanObjects, setSPObjects ] = useState(null);
  const BASE_GOLD = 50;

  function generateList(array: any[]) {
    let result = [];

    result = array.map((item, index) => 
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} key={ index } className={'item'} onClick={(event) => showContextMenu(event, item) }>
        <p>{ item.name }</p>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <p style={{ marginRight: '5px' }}>{ determinePunctionality(item.do_date, item.closing_date) }</p>
          <p>+{ BASE_GOLD * item.difficulty } 💰</p>
        </div>
      </div>);

    return result;
  }

  function determinePunctionality(doDate: Date, closingDate: Date): string {
    let todayStr = (new Date()).toLocaleDateString();
    let doDateStr = '';
    let closingDateStr = '';

    if (doDate) {
      doDateStr = doDate.toLocaleDateString();
    }
    
    if (closingDate) {
      closingDateStr = closingDate.toLocaleDateString();
    }

    if (doDate == undefined) {
      return '⚠ No Target';
    } else if (closingDate && doDateStr == closingDateStr) {
      return '✔️ On Time!';
    } else if (doDateStr == todayStr) {
      return '⚠ Finish Today!';
    } else if (closingDate < doDate) {
      return '⭐ Early ' + Math.floor(calculateDifferenceBetweenGivenDates(closingDate, doDate)) + ' day(s)!';
    } else if (doDate < new Date()) {
      return '🚨 Late ' + Math.floor(calculateDifferenceBetweenGivenDates(doDate, new Date())) + ' day(s)!';
    }
  }

  function calculateDifferenceBetweenGivenDates(date1: Date, date2: Date): number {
    /* Attribution
        - Article: https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        - Article Author: https://auth.geeksforgeeks.org/user/akshatyadav/articles
        - Changes: Edited the variable names and the comments
        - License: https://www.geeksforgeeks.org/copyright-information/ 
    */

    // Calculate the time difference between the two dates
    var timeDifference = date2.getTime() - date1.getTime();
      
    // Calculate the no. of days between the two dates
    var dayDifference = timeDifference / (1000 * 3600 * 24);
      
    return dayDifference;
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
      downstream: '',
      tag: '',
      non_property_content: '',
      full_content: '',
      file: file
     };
    
    let itemContent = await vault.cachedRead(file);

    result.full_content = itemContent;

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
    let streamsAndDateProps = ['Upstream', 'Downstream', 'Do Date', 'Due Date', 'Closing Date'];

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

      for (let j = 0; j < streamsAndDateProps.length; j++) {
        if (propertyContentArray[i].startsWith(streamsAndDateProps[j])) {
          //console.log('Starts with a upstreamAndDateProp');
          let key = streamsAndDateProps[j].toLowerCase();
          if (key.includes(' ')) {
            key = key.replace(' ', '_');
          }
          //console.log('lowercase key:', key);
          if (hasKey(result, key)) {
            result[key] = getValueFromStreamOrDateStr(propertyContentArray[i]);
          }
        }   
      }
    }

    //console.log('*** Non-Property Content ***');
    //console.log(nonPropertyContent);

    result.non_property_content = nonPropertyContent;

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

  function getValueFromStreamOrDateStr(text: string): any {
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

  async function replaceTextInFile(file: TFile, fileContent: string, oldText: string, newText: string) {
    await vault.modify(file, fileContent.replace(oldText, newText));
  }

  async function changeStatusOfSuccessPlanItem(successPlanItem: any, newStatus: string) {
    await replaceTextInFile(
      successPlanItem.file, 
      successPlanItem.full_content,  
      successPlanItem.status.toLowerCase().replaceAll(' ', '-'), 
      newStatus
    );
  }

  async function showContextMenu(event: any, successPlanItem: any) {
    const menu = new Menu(this.app);

        menu.addItem((item) =>
        item
          .setTitle("Ready to Complete")
          .setIcon("navigate-glyph")
          .onClick(async () => {
            //new Notice("Ready to Complete");
          await changeStatusOfSuccessPlanItem(successPlanItem, "ready-to-complete");
          setSPItems(null);
          setSPObjects(null);
          })
      );

      menu.addItem((item) =>
        item
          .setTitle("In Progress")
          .setIcon("wrench-screwdriver-glyph")
          .onClick(async () => {
            //new Notice("In Progress");
           await changeStatusOfSuccessPlanItem(successPlanItem, "in-progress");
           setSPItems(null);
           setSPObjects(null);
          })
      );

      menu.addItem((item) =>
        item
          .setTitle("Complete")
          .setIcon("checkmark")
          .onClick(async () => {
            //new Notice("Complete");
            await changeStatusOfSuccessPlanItem(successPlanItem, "complete");
            setSPItems(null);
            setSPObjects(null);
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