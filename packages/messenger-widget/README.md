# Messenger Widget

DM3 Protocol enables decentral, open, and secure messaging based on established web3 services like ENS and IPFS.

## Getting Started

This is an example of how you may set up your project locally.
To get a local copy up and running follow these simple example steps.

## Installation

### React.js integration :
Follow the below given steps :-

1. Create a new React.js project with typescript
   ```sh
   yarn create react-app dm3-app --template typescript
   ```
2. Navigate to dm3-app directory
   ```sh
   cd dm3-app
   ```
3. Install dm3-messenger widget from yarn
   ```sh
   yarn add @dm3-org/dm3-messenger-widget
   ```
4. Create a .env file at root level of your app or project
   ```sh
   touch .env
   ```
5. Copy the below content and paste it in .env file

   #### For Sepolia testnet :
   ```sh
    REACT_APP_ADDR_ENS_SUBDOMAIN=.beta-addr.dm3.eth
    REACT_APP_BACKEND=http://134.122.95.165/api
    REACT_APP_DEFAULT_DELIVERY_SERVICE=beta-ds.dm3.eth
    REACT_APP_DEFAULT_SERVICE=http://134.122.95.165/api
    REACT_APP_MAINNET_PROVIDER_RPC=https://eth-sepolia.g.alchemy.com/v2/<alchemy-key>
    REACT_APP_PROFILE_BASE_URL=http://134.122.95.165/api
    REACT_APP_RESOLVER_BACKEND=http://134.122.95.165/resolver-handler
    REACT_APP_USER_ENS_SUBDOMAIN=.beta-user.dm3.eth
    REACT_APP_WALLET_CONNECT_PROJECT_ID=27b3e102adae76b4d4902a035da435e7
    REACT_APP_CHAIN_ID=11155111
    REACT_APP_RESOLVER_ADDR=0xae6646c22D8eE6479eE0a39Bf63B9bD9e57bAD9d
   ```

   #### For Ethereum mainnet :
   ```sh
    REACT_APP_ADDR_ENS_SUBDOMAIN=.addr.dm3.eth
    REACT_APP_USER_ENS_SUBDOMAIN=.user.dm3.eth
    REACT_APP_BACKEND=https://app.dm3.network/api
    REACT_APP_DEFAULT_DELIVERY_SERVICE=ds.dm3.eth
    REACT_APP_DEFAULT_SERVICE=https://app.dm3.network/api
    REACT_APP_PROFILE_BASE_URL=https://app.dm3.network/api
    REACT_APP_RESOLVER_BACKEND=https://app.dm3.network/resolver-handler
    REACT_APP_WALLET_CONNECT_PROJECT_ID=27b3e102adae76b4d4902a035da435e7
    REACT_APP_MAINNET_PROVIDER_RPC=https://eth-mainnet.g.alchemy.com/v2/<alchemy-key>
    REACT_APP_CHAIN_ID=1
    REACT_APP_RESOLVER_ADDR=0xae6646c22D8eE6479eE0a39Bf63B9bD9e57bAD9d
   ```

6. Replace the alchemy-key of REACT_APP_MAINNET_PROVIDER_RPC with your original key
7. In the file src/App.tsx use the widget in this way
   ```sh
   import { DM3, DM3Configuration } from '@dm3-org/dm3-messenger-widget';

    function App() {

        const props: DM3Configuration = {
            userEnsSubdomain: process.env.REACT_APP_USER_ENS_SUBDOMAIN as string,
            addressEnsSubdomain: process.env.REACT_APP_ADDR_ENS_SUBDOMAIN as string,
            resolverBackendUrl: process.env.REACT_APP_RESOLVER_BACKEND as string,
            profileBaseUrl: process.env.REACT_APP_PROFILE_BASE_URL as string,
            defaultDeliveryService: process.env.REACT_APP_DEFAULT_DELIVERY_SERVICE as string,
            backendUrl: process.env.REACT_APP_BACKEND as string,
            chainId: process.env.REACT_APP_CHAIN_ID as string,
            resolverAddress: process.env.REACT_APP_RESOLVER_ADDR as string,
            defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE as string,
            ethereumProvider: process.env.REACT_APP_MAINNET_PROVIDER_RPC as string,
            walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID as string,
            defaultContact: 'help.dm3.eth',
            showAlways: true,
            hideFunction: undefined, 
            showContacts: true,
            theme: undefined, 
            signInImage: undefined,
        };

        return (
            <div className="demo-container">
                <DM3 {...props} />
            </div>
        );
    }

    export default App;
   ```
8. Add the following style to the dm3-container in App.css file
   ```sh
    .demo-container {
        border-radius: 25px;  /* Optional property */
        overflow: hidden;  /* Optional property only if wanted set border radius */
        height: 100vh; /* If the container has no height, then it is mandatory to set some height*/
        width: 100vw; /* If the container has no width, then it is mandatory to set some width */
    }
   ```
9. Start the project by running following command in terminal
   ```sh
    yarn start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>