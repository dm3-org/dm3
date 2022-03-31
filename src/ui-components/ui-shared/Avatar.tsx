import React, { useContext, useEffect, useState } from 'react';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import makeBlockie from 'ethereum-blockies-base64';
import './Avatar.css';
import { useAsync } from './useAsync';

interface AvatarProps {
    contact: Lib.Account;
    large?: boolean;
}

function Avatar(props: AvatarProps) {
    const [avatar, setAvatar] = useState<string | undefined>();
    const { state } = useContext(GlobalContext);

    const getAvatar = async () => {
        const ensName = state.ensNames.get(props.contact.address);
        return ensName
            ? await state.connection.provider!.getAvatar(ensName!)
            : undefined;
    };

    useAsync(
        getAvatar,
        (avatarUrl: unknown) => {
            setAvatar(avatarUrl as string | undefined);
        },
        [props.contact, state.ensNames],
    );

    // useEffect(() => {

    // }, [props.contact, state.ensNames]);

    if (avatar) {
        return (
            <img
                className={'avatar' + (props.large ? ' avatar-large' : '')}
                src={avatar}
                alt="Avatar"
            />
        );
    } else {
        return (
            <img
                className={'avatar' + (props.large ? ' avatar-large' : '')}
                src={makeBlockie(props.contact.address)}
            />
        );
    }
}

export default Avatar;
