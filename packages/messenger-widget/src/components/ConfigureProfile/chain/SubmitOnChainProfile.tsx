import { useContext } from 'react';
import { MobileView } from './MobileView';
import { NormalView } from './NormalView';
import { MOBILE_SCREEN_WIDTH } from '../../../utils/common-utils';
import { DM3ConfigurationContext } from '../../../context/DM3ConfigurationContext';

export const SubmitOnChainProfile = ({
    propertyName,
    label,
    note,
    placeholder,
    onSubmitTx,
    handleNameChange,
}: {
    propertyName: string;
    label: string;
    note: string;
    placeholder: string;
    onSubmitTx: (name: string) => void;
    handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    const { screenWidth } = useContext(DM3ConfigurationContext);

    return (
        <>
            {screenWidth <= MOBILE_SCREEN_WIDTH ? (
                <MobileView
                    propertyName={propertyName}
                    label={label}
                    note={note}
                    placeholder={placeholder}
                    onSubmitTx={onSubmitTx}
                    handleNameChange={handleNameChange}
                />
            ) : (
                <NormalView
                    propertyName={propertyName}
                    label={label}
                    note={note}
                    placeholder={placeholder}
                    onSubmitTx={onSubmitTx}
                    handleNameChange={handleNameChange}
                />
            )}
        </>
    );
};
