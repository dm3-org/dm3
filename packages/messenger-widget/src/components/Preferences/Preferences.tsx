import './Preferences.css';
import { useContext } from 'react';
import { MobileView } from './MobileView';
import { NormalView } from './NormalView';
import { MOBILE_SCREEN_WIDTH } from '../../utils/common-utils';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export function Preferences() {
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
