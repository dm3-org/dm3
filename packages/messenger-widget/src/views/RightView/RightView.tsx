import './RightView.css';
import { useContext } from 'react';
import { Profile } from '../../components/Profile/Profile';
import { logo } from '../../assets/base64/logo';
import { RightHeader } from '../../components/RightHeader/RightHeader';
import { Chat } from '../../components/Chat/Chat';
import { RightViewSelected } from '../../utils/enum-type-utils';
import { ContactInfo } from '../../components/ContactInfo/ContactInfo';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { MOBILE_SCREEN_WIDTH } from '../../utils/common-utils';
import { UiViewContext } from '../../context/UiViewContext';

export default function RightView() {
    const { screenWidth } = useContext(DM3ConfigurationContext);

    const { selectedRightView } = useContext(UiViewContext);

    return (
        <>
            <div className="col-12 p-0 h-100 background-chat chat-screen-container">
                {screenWidth < MOBILE_SCREEN_WIDTH ? (
                    <>
                        <RightHeader />
                        {selectedRightView === RightViewSelected.Chat && (
                            <Chat />
                        )}
                        {selectedRightView === RightViewSelected.Profile && (
                            <Profile />
                        )}
                        {selectedRightView ===
                            RightViewSelected.ContactInfo && <ContactInfo />}
                    </>
                ) : (
                    <>
                        <RightHeader />
                        {selectedRightView === RightViewSelected.Default && (
                            <div className="d-flex justify-content-center align-items-center default-screen">
                                <img
                                    className="img-fluid"
                                    src={logo}
                                    alt="logo"
                                />
                            </div>
                        )}
                        {selectedRightView === RightViewSelected.Chat && (
                            <Chat />
                        )}
                        {selectedRightView === RightViewSelected.Profile && (
                            <Profile />
                        )}
                        {selectedRightView ===
                            RightViewSelected.ContactInfo && <ContactInfo />}
                    </>
                )}
            </div>
        </>
    );
}
