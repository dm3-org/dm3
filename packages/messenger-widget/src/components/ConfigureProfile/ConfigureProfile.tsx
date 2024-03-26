import '../../styles/modal.css';
import './ConfigureProfile.css';
import { useContext } from 'react';
import { MobileView } from './MobileView';
import { NormalView } from './NormalView';
import { MOBILE_SCREEN_WIDTH } from '../../utils/common-utils';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ConfigureProfileContextProvider } from './context/ConfigureProfileContext';
import { ConfigureDM3NameContextProvider } from './context/ConfigureDM3NameContext';

export function ConfigureDM3Profile() {
    const { screenWidth } = useContext(DM3ConfigurationContext);

    return (
        <>
            {screenWidth <= MOBILE_SCREEN_WIDTH ? (
                <MobileView />
            ) : (
                <NormalView />
            )}
        </>
    );
}

export function ConfigureProfile() {
    return (
        <ConfigureProfileContextProvider>
            <ConfigureDM3NameContextProvider>
                <ConfigureDM3Profile />
            </ConfigureDM3NameContextProvider>
        </ConfigureProfileContextProvider>
    );
}
