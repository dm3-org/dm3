import { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Dm3Props } from '../../interfaces/config';
import Dashboard from '../../views/Dashboard/Dashboard';
import { SignIn } from '../SignIn/SignIn';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ethers } from 'ethers';
import { MessageContextProvider } from '../../context/MessageContext';
import { ConversationContextProvider } from '../../context/ConversationContext';
import { Loader } from '../Loader/Loader';

function DM3(props: Dm3Props) {
    const { setDm3Configuration, setScreenWidth } = useContext(
        DM3ConfigurationContext,
    );

    const { isLoggedIn } = useContext(AuthContext);

    // updates rainbow kit provider height to 100% when rendered
    useEffect(() => {
        const childElement = document.getElementById('data-rk-child');
        if (childElement && childElement.parentElement) {
            childElement.parentElement.classList.add('h-100');
        }

        // sets the DM3 confguration provided from props
        setDm3Configuration(props.config);
    }, []);

    // This handles the responsive check of widget
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const fn = async () => {
            const reverseRecord = `${'0x9a0b49ee9562f042112fd5d2e34dbef7a3f690f5'
                .slice(2)
                .toLowerCase()}.addr.reverse`;

            const reverseNode = ethers.utils.namehash(reverseRecord);

            console.log('reverseNode', reverseNode);

            const name = 'ojmoinmkmji.op.dm3.eth';
            const node = ethers.utils.namehash(name);

            console.log('node', node);
            const rpc =
                'https://eth-sepolia.g.alchemy.com/v2/cBTHRhVcZ3Vt4BOFpA_Hi5DcTB1KQQV1';
            const provider = new ethers.providers.JsonRpcProvider(rpc, {
                name: 'sepolia',
                chainId: 11155111,
                ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
            });

            const resolver = new ethers.providers.Resolver(
                provider,
                '0x2BAD1FeC0a2629757470984284C11EA00adB8E6F',
                name,
            );

            console.log('resolver', resolver);
            const i = new ethers.utils.Interface([
                //0xa700fc32000000000000000000000000f5b24cd05d6e6e9b8ac2b97cd90c38a8f2df57fb
                'function addr(bytes32) returns(address)',
                //0xa700fc32000000000000000000000000f5b24cd05d6e6e9b8ac2b97cd90c38a8f2df57fb
                'function text(bytes32 node, string calldata key) external view returns (string memory)',
                'function resolve(bytes,bytes) returns (bytes memory result)',
            ]);
            const innerReq = i.encodeFunctionData('addr', [node]);
            const outerReq = i.encodeFunctionData('resolve', [
                ethers.utils.dnsEncode(name),
                innerReq,
            ]);

            const res = await provider.call({
                to: '0x2BAD1FeC0a2629757470984284C11EA00adB8E6F',
                data: outerReq,
                ccipReadEnabled: true,
            });

            console.log('res', res);

            //decode function result

            const decoded = i.decodeFunctionResult('resolve', res);

            console.log('decoded', decoded);
        };
        fn();
    }, []);

    return (
        <div id="data-rk-child" className="h-100">
            <ConversationContextProvider config={props.config}>
                <MessageContextProvider>
                    <Loader />
                    {!isLoggedIn ? (
                        <SignIn />
                    ) : (
                        <div className="h-100 background-container">
                            <Dashboard />
                        </div>
                    )}
                </MessageContextProvider>
            </ConversationContextProvider>
        </div>
    );
}

export default DM3;
