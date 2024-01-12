import { TLDResolver } from './TLDResolver';

const TOP_LEVEL_DOMAIN = '.gno';
//Change to .gnosis as soon as they changed the resolver in their governance
const TOP_LEVEL_ALIAS = '.alex1234.eth';

export class Genome extends TLDResolver {
    constructor() {
        super(TOP_LEVEL_DOMAIN, TOP_LEVEL_ALIAS);
    }
}
