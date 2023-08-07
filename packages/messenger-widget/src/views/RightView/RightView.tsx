import './RightView.css';
import { useContext } from 'react';
import { Profile } from '../../components/Profile/Profile';
import { logo } from '../../assets/base64/logo';
import { RightHeader } from '../../components/RightHeader/RightHeader';
import { GlobalContext } from '../../utils/context-utils';
import { Chat } from '../../components/Chat/Chat';
import { RightViewSelected } from '../../utils/enum-type-utils';
import { ContactInfo } from '../../components/ContactInfo/ContactInfo';

export default function RightView() {
    // fetches context storage
    const { state } = useContext(GlobalContext);

    return (
        <>
            <div className="col-12 p-0 h-100 border-radius-8 background-chat chat-screen-container">
                <RightHeader />
                {state.uiView.selectedRightView ===
                    RightViewSelected.Default && (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <img className="img-fluid" src={logo} alt="logo" />
                    </div>
                )}
                {state.uiView.selectedRightView === RightViewSelected.Chat && (
                    <Chat />
                )}
                {state.uiView.selectedRightView ===
                    RightViewSelected.Profile && <Profile />}
                {state.uiView.selectedRightView ===
                    RightViewSelected.ContactInfo && (
                    <ContactInfo />
                )}
            </div>
        </>
    );
}
