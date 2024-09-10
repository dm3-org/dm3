import { useContext } from 'react';
import { MobileView } from './MobileView';
import { NormalView } from './NormalView';
import { MOBILE_SCREEN_WIDTH } from '../../../utils/common-utils';
import { DM3ConfigurationContext } from '../../../context/DM3ConfigurationContext';

export const DM3Name = ({
    nameExtension,
    placeholder,
    submitDm3UsernameClaim,
}: {
    nameExtension: string;
    placeholder: string;
    submitDm3UsernameClaim: (dm3UserEnsName: string) => void;
}) => {
    const { screenWidth } = useContext(DM3ConfigurationContext);

    return (
        <>
            {screenWidth <= MOBILE_SCREEN_WIDTH ? (
                <MobileView
                    nameExtension={nameExtension}
                    placeholder={placeholder}
                    submitDm3UsernameClaim={submitDm3UsernameClaim}
                />
            ) : (
                <NormalView
                    nameExtension={nameExtension}
                    placeholder={placeholder}
                    submitDm3UsernameClaim={submitDm3UsernameClaim}
                />
            )}
        </>
    );
};
