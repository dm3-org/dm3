# DM3 Billboard Widget

The DM3 Billboard Widget is a billboard-like component for displaying messages gathered via [DM3 protocol](https://github.com/corpus-io/dm3/tree/develop#readme).

## Installation

First, install the package using npm:

```bash
npm install dm3-billboard-widget
# or using yarn:
yarn add dm3-billboard-widget
```

## Usage

### Here is a basic usage example:

```tsx
// import the css for default styles
import 'dm3-billboard-widget/dist/style.css';

function App() {
    return <BillboardWidget web3Provider={window.ethereum} />;
}
```

### More complex usage example

```tsx
import {
    BillboardWidget,
    BillboardWidgetProps,
    ClientProps,
} from 'dm3-billboard-widget';
import { ethers } from 'ethers';

const web3Provider = new ethers.providers.JsonRpcProvider();

const billboardProps: BillboardWidgetProps = {
    web3Provider: web3Provider,
    options: {
        className: 'my-billboard',
        avatarSrc: (hash) => `https://robohash.org/${hash}?size=38x38`,
    },
    clientOptions: {
        mockedApi: true,
        billboardId: 'billboard.eth',
        websocketUrl: 'http://localhost:3000',
    },
    authOptions: {
        deliveryServiceUrl: 'beta-ds.dm3.eth',
        offchainResolverUrl: 'https://dm3-beta2-resolver.herokuapp.com',
        siweAddress: ethers.constants.AddressZero,
        siweSig: ethers.constants.HashZero,
    },
    scrollOptions: {
        withToBottomButton: true,
        behavior: 'smooth',
    },
    branding: {
        logoImageSrc: '/path/to/logo.png',
        emptyMessagesImageSrc: '/path/to/empty.png',
        slogan: 'Your Slogan Here',
        emptyViewText: 'No messages',
    },
};

function App() {
    return <BillboardWidget {...billboardProps} />;
}
```

## BillboardWidgetProps

The properties for the `BillboardWidget` component.

### web3Provider

A `StaticJsonRpcProvider` from ethers.js. This is the provider used to connect to an Ethereum node, which is required for the widget to interact with the Ethereum blockchain.

### options

Common billboard widget options:

-   `className`: A custom CSS class that will be added to the main div of the widget. This can be used for custom styling.

-   `avatarSrc`: A custom URL for all user avatars,  that takes the user's identifier (hash) and returns a URL. This function will be used to generate avatar images for users.

-   `userNameResolver`: A custom user name resolver function that takes the user identifier and returns a new string or a promise resolving to a string.

-   `dateFormat`: Formatting string for the date of each message, using date-fns formatter function.

    - See: https://date-fns.org/v2.30.0/docs/format

    - The default is `P` which stands for _Long localized date_.

- `relativeDate`: Display a relative date for recent dates. Default is `true`.

### clientOptions

Config for the billboard message fetching part:

-   `mockedApi`: A boolean flag indicating whether to use a mocked version of the client API. Useful for testing or when a client is not available. The default value is true.

-   `billboardId`: A string identifier for the billboard.

-   `fetchSince`: A date object indicating from when to start fetching messages.

-   `limit`: The maximum number of messages to fetch.

-   `websocketUrl`: The URL of the WebSocket server to connect to for receiving real-time updates.

### authOptions

Auth options are required to submit a new message using your dm3 profile:

-   `deliveryServiceUrl`: The URL of the delivery service.

-   `offchainResolverUrl`: The URL of the offchain resolver.

-   `siweAddress`: The address used for SIWE (Sign In With Ethereum).

-   `siweSig`: The signature used for SIWE.

### scrollOptions

Fine tune your auto scrolling:

-   `withToBottomButton`: A boolean flag indicating whether to display a Scroll-to-Bottom button.

-   `behavior`: The scrolling behavior. Can be either 'smooth' or 'auto'.

-   `containerClassName`: A custom CSS class that will be added to the scrolling container.

### branding

Branding options to customize the default DM3 branding logos etc:

-   `logoImageSrc`: The source URL of a small logo that will always be displayed on top.

-   `emptyMessagesImageSrc`: The source URL of an image that will be displayed when no messages have been received.

-   `slogan`: A slogan string that will be displayed next to the small logo on top.

-   `emptyViewText`: A small text that will be displayed when no messages have been received.

## Defaults

Default properties are provided for clientOptions, and options:

You can override these defaults by providing your own values in the BillboardWidgetProps.

```ts
const defaultClientProps: ClientProps = {
    mockedApi: true,
    billboardId: 'billboard.eth',
    fetchSince: undefined,
    limit: undefined,
    websocketUrl: 'http://localhost:3000',
    deliveryServiceUrl: 'beta-ds.dm3.eth',
    offchainResolverUrl: 'https://dm3-beta2-resolver.herokuapp.com',
    siweAddress: ethers.constants.AddressZero,
    siweSig: ethers.constants.HashZero,
};

const defaultOptions: BillboardWidgetProps['options'] = {
    avatarSrc: (hash) => {
        return `https://robohash.org/${hash}?size=38x38`;
    },
};
```

## License

TODO
