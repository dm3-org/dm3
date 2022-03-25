import React, { useContext, useEffect, useState } from 'react';
import * as Lib from '../lib';
import { GlobalContext } from '../GlobalContextProvider';
import makeBlockie from 'ethereum-blockies-base64';
import './Avatar.css';

interface AvatarProps {
    contact: Lib.Account;
    large?: boolean;
}

function Avatar(props: AvatarProps) {
    const [avatar, setAvatar] = useState<string | undefined>();
    const { state } = useContext(GlobalContext);

    const getAvatar = async () => {
        const ensName = state.ensNames.get(props.contact.address);
        if (ensName) {
            const url = await state.connection.provider!.getAvatar(ensName!);
            setAvatar(url ?? undefined);
        } else {
            setAvatar(undefined);
        }
    };

    useEffect(() => {
        getAvatar();
    }, [props.contact, state.ensNames]);

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
