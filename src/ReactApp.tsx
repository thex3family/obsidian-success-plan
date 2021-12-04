import * as React from "react";
import { useApp } from "./hooks";
import { useState, useEffect } from 'react';
import { Menu, Notice, TFile } from 'obsidian';
import HorizontalTabs from "./components/HorizontalTabs";
import { ItemModal } from "./components/ItemModal";
import { uppercaseFirstChar, lowercaseAndReplaceSep } from "src/utility";
import { Fab } from 'react-tiny-fab';
import { MdAdd } from "react-icons/md";
import 'react-tiny-fab/dist/styles.css';

export default function ReactApp(settings: any) {
  const { vault } = useApp(); // hook that gives us access to the Obsidian app object (ex. <h4>{vault.getName()}</h4>)
  const [ successPlanItems, setSPItems ] = useState(null);
  const [ successPlanObjects, setSPObjects ] = useState(null);
  const [ activeTab, setTab ] = useState('Task');
  const BASE_GOLD = 50;

  let baseHideLedgerValues = { ready_to_start: true, next_up: true, in_progress: true, complete: true, backlog: true, canceled: true };
  const [ taskHideLedger, setTaskHideLedger ] = useState({ ...baseHideLedgerValues, next_up: false, in_progress: false });
  const [ projectHideLedger, setProjectHideLedger ] = useState({ ...baseHideLedgerValues, in_progress: false });
  const [ keyResultHideLedger, setKeyResultHideLedger ] = useState({ ...baseHideLedgerValues, in_progress: false });
  const [ goalHideLedger, setGoalHideLedger ] = useState({ ...baseHideLedgerValues, in_progress: false });

  /* // Related to Make Work Fun
  async function addWin(successPlanItem: any) { 

    const prod_url = 'https://joshwin.app.n8n.cloud/webhook/obsidian-to-notion'; // TODO: This endpoint is no longer valid.

    const data = {
      body: {
        parent: { database_id: settings.settings.notionDatabaseID },
        properties: {
          "Name": { type: "title", title: [{ "type": "text", "text": { "content": successPlanItem.name } }] },
          "Share With Family?": { type: "checkbox", checkbox: successPlanItem.share_with_family }
        }, 
      },
      other: { integration_key: settings.settings.notionIntegrationKey }
    };    

    const response = await fetch(prod_url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'no-cors', // no-cors, *cors, same-origin
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
  }
  */

  function getCurrentTabHideLedger() {
    switch (activeTab) {
      case 'Task':
        return taskHideLedger;
      case 'Project':
        return projectHideLedger;
      case 'Key Result':
        return keyResultHideLedger;
      case 'Goal':
        return goalHideLedger;
      default:
        break;
    }
  }

  function generateList(array: any[]) {
    let result = [];

    result = array.map((item, index) => 
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} key={ index } className={'item'} onClick={(event) => showContextMenu(event, item) }>
        <p>{ item.name }</p>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          { <p style={{ marginRight: '10px' }}>{ determinePunctionality(item.do_date, item.closing_date) }</p>}
          { item.difficulty ? <p>+{ BASE_GOLD * item.difficulty } 💰</p> : null }
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

    if (doDate == undefined || doDateStr == "") {
      return '⚠ No Target';
    } else if (new Date() < doDate) {
      return Math.floor(calculateDifferenceBetweenGivenDates(new Date(), doDate)) + ' day(s) to go!';
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
      share_with_family: '', // the boolean value will be in the form of a string
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
      view_content: '',
      note_content: '',
      full_content: '',
      file: file
     };
    
    //console.log('file path:', file.path);

    let itemContent = await vault.cachedRead(file);

    result.full_content = itemContent;

    //console.log(file.name);

    // split using '---' (use the first element to get the value of the other properties besides content)
    let contentArray = itemContent.split('---');
    let propertyContent = contentArray[0];
    let viewContent = contentArray[1];
    let noteContent = contentArray[2];

    // split the property content using carriage return ('\n') - assuming this gives me what I want

    let propertyContentArray = propertyContent.split('\n');

    let tagProps = ['Type', 'Status', 'Difficulty', 'Tag', 'Impact', 'Share with Family'];
    let streamsAndDateProps = ['Upstream', 'Downstream', 'Do Date', 'Due Date', 'Closing Date'];

    // check what the string starts with (only difference: upstream/dates vs everything else) - dif: page vs tag
    for (let i = 0; i < propertyContentArray.length; i++) {
      //console.log(i, propertyContentArray[i]);

      for (let k = 0; k < tagProps.length; k++) {
        if (propertyContentArray[i].startsWith(tagProps[k])) {
          //console.log('Starts with a tagProp');
          //console.log('Starts with a tag');
          let key = tagProps[k].includes(' ') ? lowercaseAndReplaceSep('Share with Family', ' ', '_') : tagProps[k].toLowerCase();
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

    result.view_content = viewContent.trim();
    result.note_content = noteContent;

    //console.log('result:', result);

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
    let secondHalf = text.split('::')[1];

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
    let secondHalf = text.split('::')[1];
    
    if (secondHalf.includes('[[')) {
      result = secondHalf.replace('[[', '').replace(']]', '').trim();

      if (text.includes('Date')) {
        result = new Date(result);
      }
    }
    
    return result;
  }

  function getItemsOfGivenTypeAndStatus(itemType: string, itemStatus: string) {
    let result = [];

    for (let i = 0; i < successPlanObjects.length; i++) {

      if (successPlanObjects[i].type == itemType && successPlanObjects[i].status == itemStatus) {
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

  async function changeStatusOfSuccessPlanItem(successPlanItem: any, newStatus: string) { // TODO: This assumes that I know the item's status (this relates to me editing items)
    await replaceTextInFile(
      successPlanItem.file, 
      successPlanItem.full_content,  
      successPlanItem.status.toLowerCase().replaceAll(' ', '-'), 
      newStatus
    );
  }

  /* Related to Make Work Fun
  async function postWinIfCompleteAndSharedWithFamily(successPlanItem: any) {
    if (successPlanItem.status == "Complete" && successPlanItem.share_with_family === 'true') {
      await addWin({ ...successPlanItem, share_with_family: true });
    }
  }
  */

  async function updateSuccessPlanItem(successPlanItem: any) {
    await vault.modify(successPlanItem.file, prepareFileContent(successPlanItem));
    //await postWinIfCompleteAndSharedWithFamily(successPlanItem); // Disabling until Make Work Fun stuff is completed and turned back on
    resetSuccessPlanItemState();
  }

  function resetSuccessPlanItemState() {
    setSPItems(null);
    setSPObjects(null);
  }

  async function showContextMenu(event: any, successPlanItem: any) { // TODO: Only show the option for share with family if the gamification setting is on
    const menu = new Menu(this.app);

          menu.addItem((item) =>
          item
            .setTitle("Edit")
            .setIcon("pencil")
            .onClick(async () => {
              //new Notice("Edit");
              new ItemModal(this.app, 'EDIT', successPlanItem, async (result) => {
                new Notice(`Updated File: ${result.type} - ${result.name}`);
                console.log('Outputted SuccessPlanItem:', result);
                await updateSuccessPlanItem(result);
              }).open();
            })
        );

        menu.addItem((item) =>
        item
          .setTitle("Ready to Start")
          .setIcon("navigate-glyph")
          .onClick(async () => {
            //new Notice("Ready to Start");
          await changeStatusOfSuccessPlanItem(successPlanItem, "ready-to-start");
          resetSuccessPlanItemState();
          })
      );

      menu.addItem((item) =>
        item
          .setTitle("Next Up")
          .setIcon("right-chevron-glyph")
          .onClick(async () => {
            //new Notice("Next Up");
          await changeStatusOfSuccessPlanItem(successPlanItem, "next-up");
          resetSuccessPlanItemState();
          })
      );

      menu.addItem((item) =>
        item
          .setTitle("In Progress")
          .setIcon("wrench-screwdriver-glyph")
          .onClick(async () => {
            //new Notice("In Progress");
           await changeStatusOfSuccessPlanItem(successPlanItem, "in-progress");
           resetSuccessPlanItemState();
          })
      );

      menu.addItem((item) =>
        item
          .setTitle("Complete")
          .setIcon("checkmark")
          .onClick(async () => {
            //new Notice("Complete");
            await changeStatusOfSuccessPlanItem(successPlanItem, "complete");
            resetSuccessPlanItemState();
          })
      );

      /* // Disabling until Make Work Fun stuff is completed and turned back on
      menu.addItem((item) => 
        item
          .setTitle("Complete (+ Share with Family)")
          .setIcon("checkmark")
          .onClick(async () => {
            //new Notice("Complete (and Share with Family)");
            await changeStatusOfSuccessPlanItem(successPlanItem, "complete");
            await addWin({ ...successPlanItem, share_with_family: true });
            resetSuccessPlanItemState();
          })
      );
      */

      menu.addItem((item) =>
        item
          .setTitle("Backlog")
          .setIcon("box-glyph")
          .onClick(async () => {
            //new Notice("Backlog");
            await changeStatusOfSuccessPlanItem(successPlanItem, "backlog");
            resetSuccessPlanItemState();
          })
      );

      menu.addItem((item) =>
        item
          .setTitle("Canceled")
          .setIcon("cross")
          .onClick(async () => {
            //new Notice("Canceled");
            await changeStatusOfSuccessPlanItem(successPlanItem, "canceled");
            resetSuccessPlanItemState();
          })
      );

      menu.showAtMouseEvent(event);
  }

  function handleTabClick(tab: string) {
    setTab(tab);
  }

  function handleSectionHideClick(section: string) {

    switch(activeTab) {
      case 'Task':
        setTaskHideLedger({ ...taskHideLedger, [section]: !getTabLedgerSectionHideValue(section) });
        break;
      case 'Project':
        setProjectHideLedger({ ...projectHideLedger, [section]: !getTabLedgerSectionHideValue(section) });
        break;
      case 'Key Result':
        setKeyResultHideLedger({ ...keyResultHideLedger, [section]: !getTabLedgerSectionHideValue(section) });
        break;
      case 'Goal':
        setGoalHideLedger({ ...goalHideLedger, [section]: !getTabLedgerSectionHideValue(section) });
        break;
      default:
        break;
    } 
  }

  function getTabLedgerSectionHideValue(section: string) {
    let tabLedger = getCurrentTabHideLedger();

    if (hasKey(tabLedger, section)) {
      return tabLedger[section]
    }
  }

  function generateSections() {
    const SECTIONS = ['Ready To Start', 'Next Up', 'In Progress', 'Complete', 'Backlog', 'Canceled'];
    let result = []; 

    for (let i = 0; i < SECTIONS.length; i++) {
      let lowercaseSection = SECTIONS[i].toLowerCase().replaceAll(' ', '_');

      let list = generateList(getItemsOfGivenTypeAndStatus(activeTab, SECTIONS[i]));

      result.push(
        <div key={ i } style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <h3 style={{ marginRight: 5, color: '#ffffff80' }}>{ SECTIONS[i].includes('To') ? SECTIONS[i].replace('To', 'to') : SECTIONS[i] }</h3>
              { list.length != 0 ? <p onClick={ () => handleSectionHideClick(lowercaseSection) }>{ getTabLedgerSectionHideValue(lowercaseSection) ? 'unhide' : 'hide' }</p> : null }
          </div>
          { getTabLedgerSectionHideValue(lowercaseSection) ? null : list }
        </div>
      )
    }

    return result;
  }

  function convertDateStringToFormat(dateStr: string) {
    let resultArray = dateStr.split('-');

    for (let i = 0; i < resultArray.length; i++) {
      resultArray[i] = parseInt(resultArray[i]) < 10 ? ("0" + resultArray[i]) : resultArray[i]; 
    }

    return resultArray.join('-');
  }

  function isNotBlankOrUndefined(value: any) {
    return value != "" && value != undefined;
  }

  function prepareFileContent(successPlanItem: any) {

    //console.log('prepareFileContent');
    //console.log('successPlanitem:', successPlanItem);

    let propertiesHeader: string = "### Properties & Views\n\n";

    let properties: string = "Type:: \#type/" + lowercaseAndReplaceSep(successPlanItem.type, ' ', '-') + "\n\n" + 
    "Share with Family:: " + (isNotBlankOrUndefined(successPlanItem.share_with_family) ? ("\#share-with-family/" + (successPlanItem.share_with_family === 'True' ? 'true' : 'false')) : "") + "\n\n" +
    "Upstream:: " + (isNotBlankOrUndefined(successPlanItem.upstream) ? ("[[" + successPlanItem.upstream + "]]") : "") + "\n\n" +
    "Downstream:: " + (isNotBlankOrUndefined(successPlanItem.downstream) ? ("[[" + successPlanItem.downstream + "]]") : "") + "\n\n" +
    "Impact:: " + (isNotBlankOrUndefined(successPlanItem.impact) ? ("\#impact/" + lowercaseAndReplaceSep(successPlanItem.impact, ' ', '-')) : "") + "\n\n" +
    "Status:: " + (isNotBlankOrUndefined(successPlanItem.status) ? ("\#status/" + lowercaseAndReplaceSep(successPlanItem.status, ' ', '-')) : "") + "\n\n" +
    "Do Date:: " + (isNotBlankOrUndefined(successPlanItem.do_date) ? ("[[" + convertDateStringToFormat(successPlanItem.do_date.toLocaleDateString().replaceAll('/', '-')) + "]]") : "") + "\n\n" +
    "Due Date:: " + (isNotBlankOrUndefined(successPlanItem.due_date) ? ("[[" + convertDateStringToFormat(successPlanItem.due_date.toLocaleDateString().replaceAll('/', '-')) + "]]") : "") + "\n\n" +
    "Closing Date:: " + (isNotBlankOrUndefined(successPlanItem.closing_date) ? ("[[" + convertDateStringToFormat(successPlanItem.closing_date.toLocaleDateString().replaceAll('/', '-')) + "]]") : "") + "\n\n" +
    "Difficulty:: " + (isNotBlankOrUndefined(successPlanItem.difficulty) ? ("\#difficulty/" + successPlanItem.difficulty + "-inc") : "") + "\n\n" +
    "Tag:: " + (successPlanItem.tag != "" ? ("\#tag/" + successPlanItem.tag + "-mins") : "");

    //console.log("prepareFileContent - output - :", propertiesHeader + properties + "\n\n---\n\n" + successPlanItem.view_content + "\n\n---\n\n" + successPlanItem.note_content.trim());    
    return propertiesHeader + properties + "\n\n---\n\n" + successPlanItem.view_content + "\n\n---\n\n" + successPlanItem.note_content.trim();
  }

  async function createSuccessPlanItem(data: any) { // ex path "Success Plan/Key Results/Key Result - First KR.md"
    //prepareFileContent(data); // just for testing
    await vault.create("Success Plan/" + data.type + "s" + "/" + data.type + " - " + data.name + ".md", prepareFileContent(data));
    //await postWinIfCompleteAndSharedWithFamily(data); // Related to Make Work Fun
    resetSuccessPlanItemState();
  }

  function FABClick() {
    let defaultItem = { 
      name: '',
      share_with_family: "false",
      impact: '',
      type: activeTab,
      status: "Ready To Start",
      difficulty: '',
      do_date: '',
      due_date: '',
      closing_date: '',
      area: '',
      upstream: '',
      downstream: '',
      tag: 25,
      view_content: '```dataview\n\n```',
      note_content: '### Notes'
     };

    new ItemModal(this.app, 'CREATE', defaultItem, async (result) => {
      new Notice(`New ${result.type} Created`);
      console.log('Outputted SuccessPlanItem:', result); 
      await createSuccessPlanItem(result);
    }).open();
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
      <HorizontalTabs tabClickHandler={handleTabClick} activeTab={activeTab} />
      { successPlanObjects ?
        <>
          { generateSections() }
        </> : null
      }
      <Fab
        mainButtonStyles={{ backgroundColor: '#7F6DF2' }}
        style={{ bottom: 15, right: 15 }}
        icon={<MdAdd />}
        alwaysShowTitle={false}
        onClick={() => FABClick()}
      >
    </Fab>
    </>
  );
};