import { useContext } from 'react';
import { MobileView } from './MobileView';
import { NormalView } from './NormalView';
import { HideFunctionProps } from '../../interfaces/props';
import { MOBILE_SCREEN_WIDTH } from '../../utils/common-utils';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export function RightHeader(props: HideFunctionProps) {
    const { screenWidth } = useContext(DM3ConfigurationContext);

    return (
        <>
            {screenWidth <= MOBILE_SCREEN_WIDTH ? (
                <MobileView {...props} />
            ) : (
                <NormalView {...props} />
            )}
        </>
    );
}
