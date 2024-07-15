//The offchain resolver has to be able to manage a entire list of subdomains not just one.
//The Subdomain managers Job keep track of every subdomain supported by the Resolver
export class SubdomainManager {
    private supportedSubdomains: Set<string> = new Set();

    //The key in the process.env that contains the supported subdomains
    constructor(key: string) {
        //Read the supported subdomains from the env
        const supportedSubdomainsEnvVar = process.env[key];
        //If no supported subdomains are provided throw an error
        if (!supportedSubdomainsEnvVar) {
            throw 'No supported subdomains provided please check subdomain env var';
        }
        //Parse provided JSON env var. Use try catch to handle invalid JSON
        try {
            JSON.parse(supportedSubdomainsEnvVar).forEach((subdomain: string) =>
                this.supportedSubdomains.add(subdomain),
            );
        } catch (e) {
            console.error(e);
            console.error(
                'Error parsing supported subdomains. Please provide a valid JSON array',
                'received: ',
                supportedSubdomainsEnvVar,
            );
        }

        console.log('Supported subdomains: ', this.supportedSubdomains);
    }

    //Check if a subdomain is supported by the resolver
    public isSubdomainSupported(domain: string): boolean {
        //i.e domain = foo.dm3.eth
        //name = foo
        //subdomain = [dm3, eth]
        const [name, ...subdomainSegments] = domain.split('.');

        const subdomain = subdomainSegments.join('.');
        return this.supportedSubdomains.has(subdomain);
    }
}
