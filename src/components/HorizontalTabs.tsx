import * as React from "react";

interface TabProps {
    tabClickHandler: (tab: string) => void,
    activeTab: string
}

export default function HorizontalTabs(Props: TabProps) {

    function getStyling(tab: string): any {
        return Props.activeTab == tab ?
            { fontWeight: 'bold', color: '#7F6DF2' } : { fontWeight: 'normal', color: 'white' }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
            <p style={ getStyling('Task') } onClick={() => Props.tabClickHandler('Task')}>Tasks</p>
            <p style={ getStyling('Project') } onClick={() => Props.tabClickHandler('Project')}>Projects</p>
            <p style={ getStyling('Key Result') } onClick={() => Props.tabClickHandler('Key Result')}>Key Results</p>
            <p style={ getStyling('Goal') } onClick={() => Props.tabClickHandler('Goal')}>Goals</p>
        </div>
    );
}