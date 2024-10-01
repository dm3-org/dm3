import { useEffect, useState } from 'react';
import { Heading } from '../Heading/Heading';
import './Settings.css';

// message view option type ex : OLD/NEW
export type MsgViewOptionType = {
    name: string;
    viewType: string;
    isEnabled: boolean;
};

// settings data type to be used to store in local storage
export type SettingsDataType = {
    messageView: string;
};

export function Settings() {
    // heading of the page
    const heading = 'Settings';

    // description of the page
    const description = 'Define how you want to enable/disable components';

    // available message view options
    const msgViewOptions = [
        {
            name: 'Old message view',
            viewType: 'OLD',
            isEnabled: true,
        },
        {
            name: 'New message view',
            viewType: 'NEW',
            isEnabled: true,
        },
    ];

    // state to handle current message view type selected to show in chat screen
    const [msgViewSelected, setMsgViewSelected] = useState<MsgViewOptionType>(
        msgViewOptions[0],
    );

    const getSettingsFromLocalStorage = () => {
        // fetch settings data from local storage
        const settingsData = localStorage.getItem('settings');
        // return data if found else return null
        return settingsData ? JSON.parse(settingsData) : null;
    };

    const configureMsgView = () => {
        // fetch message view type from local storage
        const settingsData: SettingsDataType | null =
            getSettingsFromLocalStorage();
        // if message view found in local storage
        if (settingsData && settingsData.messageView) {
            // filter out the message type selected from available options
            const msgViewType = msgViewOptions.filter(
                (m) => m.viewType === settingsData.messageView,
            );
            // set the selected view type
            setMsgViewSelected(
                msgViewType.length ? msgViewType[0] : msgViewOptions[0],
            );
        }
    };

    const updateSettingsInLocalStorage = (data: SettingsDataType) => {
        // convert JSON data of settings into string
        const settingsData = JSON.stringify(data);
        // save the data into local storage
        localStorage.setItem('settings', settingsData);
    };

    const updateMsgView = (msgView: MsgViewOptionType) => {
        // get the view type from selected message view type object
        const { viewType } = msgView;

        // update local state of message view type selected
        setMsgViewSelected(msgView);

        // fetch local storage data for settings
        const settingsData: SettingsDataType | null =
            getSettingsFromLocalStorage();

        // update the property of message view
        if (settingsData) {
            settingsData.messageView = viewType;
        }

        // create a updated object based on the data
        const updatedSettings = settingsData
            ? settingsData
            : {
                  messageView: viewType,
              };

        // update the local storage with the new message view type
        updateSettingsInLocalStorage(updatedSettings);
    };

    // on screen load, get the settings data from local storage ad update the states
    useEffect(() => {
        configureMsgView();
    }, []);

    return (
        <div>
            {/* heading of the page */}
            <Heading heading={heading} description={description} />

            {/* title and description of the property */}
            <div className="settings-msg-view">
                <div className="mt-2 font-weight-800 msg-view-heading">
                    Message View
                </div>
                <div className="font-size-14 msg-view-desc">
                    Select a view how the message should look like
                </div>
            </div>

            {/* radio button options to select the message view type */}
            <div>
                <div className="settings-option-container">
                    {msgViewOptions.map((option, index) => (
                        <div
                            key={index}
                            className="radio d-flex mb-3 width-fit"
                            onClick={() => {
                                updateMsgView(option);
                            }}
                        >
                            <input
                                type="radio"
                                value={option.viewType}
                                checked={
                                    option.viewType === msgViewSelected.viewType
                                }
                                readOnly
                            />
                            <label className="settings-option radio-label">
                                {option.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
