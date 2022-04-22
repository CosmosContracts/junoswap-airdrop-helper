
import { readFile } from 'fs/promises';
import * as fs from "fs"

const JUNO_COMMUNITY_POOL = "juno1jv65s3grqf6v6jl3dp4t6c9t9rk99cd83d88wr";

const CUSTODIAL_ADDRESSES = [
   "juno1aeh8gqu9wr4u8ev6edlgfq03rcy6v5twfn0ja8", // CCN
]

const FULL_PHILANTHROPIST_ADDRESSES = [
    "juno190g5j8aszqhvtg7cprmev8xcxs6csra7xnk3n3", // Core 1 multisig
]

const PHILANTHROPIST_ADDRESSES = [
    "juno18qw9ydpewh405w4lvmuhlg9gtaep79vy2gmtr2", // Core 1 member
    "juno1s33zct2zhhaf60x4a90cpe9yquw99jj0zen8pt", // Core 1 member
    "juno17py8gfneaam64vt9kaec0fseqwxvkq0flmsmhg", // Core 1 member
    "juno1a8u47ggy964tv9trjxfjcldutau5ls705djqyu", // Core 1 member
]

let showHelp = () => {
    console.log(`Extract delegators from snapshot, calculate total staked excluding custodial addresses`)
    console.log("");
    console.log("Usage: npm run juno-stakers <delegations file> <output file>");
    console.log("Example: npm run juno-stakers ./snap_1800000_delegations.json output.json");
    console.log("");
}

let main = async () => {

    // Args
    var [_, _, balancesFile, outPutFile] = process.argv;

    // Load snapshot
    var delegations = JSON.parse(await readFile(
        new URL(`${balancesFile}`, import.meta.url)
    ))

    // Extract balances and calculate total juno in pools
    var tot = 0;
    var shares = [];

    for (var delegation of delegations) {
        var address = delegation.delegator_address;

        // skip smart contracts
        if (address.length > 43) {
            continue;
        }

        // Skip dust (< 0.005 JUNO)
        if (delegation.shares < 5000) {
            continue;
        } 

        // skip custodial addresses
        if (CUSTODIAL_ADDRESSES.indexOf(address) !== -1) {
            continue;
        }

        // send full philantropist addresses to the juno community pool
        if (FULL_PHILANTHROPIST_ADDRESSES.indexOf(address) !== -1) {
            address = JUNO_COMMUNITY_POOL;
        }

        // send 80% of philantropist addresses to the juno community pool
        if (PHILANTHROPIST_ADDRESSES.indexOf(address) !== -1) {
            
            var communityPool = shares.find((el) => el.address == JUNO_COMMUNITY_POOL);

            var fullAmount = parseInt(delegation.shares);
            var communityAmount = Math.floor(fullAmount * 0.8);
            var selfAmount = fullAmount - communityAmount;

            if (communityPool === undefined) {
                shares.push({
                    address: JUNO_COMMUNITY_POOL,
                    amount: parseInt(communityAmount),
                })
            } else {
                communityPool.amount += parseInt(communityAmount)
            }

            tot += parseInt(communityAmount)
            delegation.shares = selfAmount;
        }

        var curAirdrop = shares.find((el) => el.address == address);

        if (curAirdrop === undefined) {
            shares.push({
                address: address,
                amount: parseInt(delegation.shares),
            })
        } else 
        {
            curAirdrop.amount += parseInt(delegation.shares);
        }

        tot += parseInt(delegation.shares)
    }


    // Generate output
    var output = {
        balances: shares,
        total: tot
    }

    // Write pool data to file
    fs.writeFileSync(outPutFile, JSON.stringify(output))
}

main();