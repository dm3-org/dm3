import React, { useContext, useEffect, useState } from 'react';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import makeBlockie from 'ethereum-blockies-base64';
import './Avatar.css';
import { useAsync } from './useAsync';

export enum SpecialSize {
    Md,
    Lg,
}

interface AvatarProps {
    accountAddress: string;
    specialSize?: SpecialSize;
}

function Avatar(props: AvatarProps) {
    const [avatar, setAvatar] = useState<string | undefined>();
    const { state } = useContext(GlobalContext);

    const getAvatar = async () => {
        const ensName = state.ensNames.get(props.accountAddress);
        return ensName
            ? await state.connection.provider!.getAvatar(ensName!)
            : undefined;
    };

    useAsync(
        getAvatar,
        (avatarUrl: unknown) => {
            setAvatar(avatarUrl as string | undefined);
        },
        [props.accountAddress, state.ensNames],
    );

    // useEffect(() => {

    // }, [props.contact, state.ensNames]);

    if (!props.accountAddress) {
        return null;
    }

    const style = (specialSize: SpecialSize | undefined) => {
        switch (specialSize as SpecialSize) {
            case SpecialSize.Lg:
                return {
                    borderRadius: '0.5rem',
                    height: '10rem',
                };
            case SpecialSize.Md:
                return {
                    borderRadius: '0.5rem',
                    height: '3.5rem',
                };
            default:
                return {
                    borderRadius: '0.5rem',
                    height: '2.5rem',
                };
        }
    };

    return avatar ? (
        <img
            className={'avatar'}
            src={avatar}
            style={style(props.specialSize)}
            alt="Avatar"
        />
    ) : (
        <img
            className={'avatar'}
            style={style(props.specialSize)}
            src={makeBlockie(props.accountAddress)}
            alt="Avatar"
        />
    );
}

export default Avatar;
