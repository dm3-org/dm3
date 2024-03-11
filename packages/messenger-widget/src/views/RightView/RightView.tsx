import './RightView.css';
import { useContext } from 'react';
import { Profile } from '../../components/Profile/Profile';
import { logo } from '../../assets/base64/logo';
import { RightHeader } from '../../components/RightHeader/RightHeader';
import { GlobalContext } from '../../utils/context-utils';
import { Chat } from '../../components/Chat/Chat';
import { RightViewSelected } from '../../utils/enum-type-utils';
import { ContactInfo } from '../../components/ContactInfo/ContactInfo';
import { HideFunctionProps } from '../../interfaces/props';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { MOBILE_SCREEN_WIDTH } from '../../utils/common-utils';

export default function RightView(props: HideFunctionProps) {
    // fetches context storage
    const { state } = useContext(GlobalContext);

    const { screenWidth } = useContext(DM3ConfigurationContext);

    return (
        <>
            <div className="col-12 p-0 h-100 background-chat chat-screen-container">
                {screenWidth < MOBILE_SCREEN_WIDTH ? (
                    <>
                        <RightHeader showContacts={props.showContacts} />
                        {state.uiView.selectedRightView ===
                            RightViewSelected.Chat && (
                            <Chat hideFunction={props.hideFunction} />
                        )}
                        {state.uiView.selectedRightView ===
                            RightViewSelected.Profile && <Profile />}
                        {state.uiView.selectedRightView ===
                            RightViewSelected.ContactInfo && <ContactInfo />}
                    </>
                ) : (
                    <>
                        <RightHeader showContacts={props.showContacts} />
                        {state.uiView.selectedRightView ===
                            RightViewSelected.Default && (
                            <div className="d-flex justify-content-center align-items-center default-screen">
                                <img
                                    className="img-fluid"
                                    src={logo}
                                    alt="logo"
                                />
                            </div>
                        )}
                        {state.uiView.selectedRightView ===
                            RightViewSelected.Chat && (
                            <Chat hideFunction={props.hideFunction} />
                        )}
                        {state.uiView.selectedRightView ===
                            RightViewSelected.Profile && <Profile />}
                        {state.uiView.selectedRightView ===
                            RightViewSelected.ContactInfo && <ContactInfo />}
                    </>
                )}
            </div>
        </>
    );
}
