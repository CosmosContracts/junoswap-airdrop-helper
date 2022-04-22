import { fromHex } from "@cosmjs/encoding";
import { readFile } from 'fs/promises';
import * as fs from "fs"

let pools = [
    { // JUNO-ATOM
        swap: "juno1sg6chmktuhyj4lsrxrrdflem7gsnk4ejv6zkcc4d3vcqulzp55wsf4l4gl",
        lp: "juno18ckrreffz9jwmkw84axsvncexfqt7gpgckskk0yy0vzwm9huqkyq6v78xu",
        name: "juno_atom"
    },
    { // JUNO-UST
        swap: "juno1hue3dnrtgf9ly2frnnvf8z5u7e224ctc4hk7wks2xumeu3arj6rs9vgzec",
        lp: "juno1l0z6d7wlwpwequtenwt8pd44685jyhqys6jdnp8xa8ektn0un4zsadyw8y",
        name: "juno_ust"
    },
    { // JUNO-OSMO
        swap: "juno1el6rfmz6h9pwpdlf6k2qf4dwt3y5wqd7k3xpyvytklsnkt9uv2aqe8aq4v",
        lp: "juno100pmxfny54wktum5jklg9vme7d5pe44h7va6uw4smccte6wkfaust0untw",
        name: "juno_osmo"
    },
    { // JUNO-NETA
        swap: "juno1e8n6ch7msks487ecznyeagmzd5ml2pq9tgedqt2u63vra0q0r9mqrjy6ys",
        lp: "juno1jmechmr7w6kwqu8jcy5973rtllxgttyetarys60rtsu0g675mkjsy96t8l",
        name: "juno_neta"
    },
]
let findContract = (contracts, address) => {
   return contracts.find((el) => el.contract_address === address);
}

// function that extract all balances from a CW20 contract (LP Token)
let getBalancesFromCW20State = (contract_state) => {

    const balances = []
    let total = 0;

    // Iterate balances
    contract_state.forEach((el) => {
        // decode key (if anyone know a better way to do this please send a PR)
        var keyBytes = fromHex(el.key.substring(4));
        var decoded = new Buffer.from(keyBytes).toString();

        if (decoded.startsWith("balance")) {

            // separate address
            var address = decoded.substring(7)

            // Decode balance
            var balance = parseInt(new Buffer.from(el.value, "base64").toString().replace('"', ""))
            // console.log(`Balance ${address}: ${parseInt(balance)}`)

            if (balance > 0) {
                balances.push({
                    address: address,
                    amount: balance
                })
            
                total += balance; // this could be get also from token_info.total_supply but I'm lazy
            }
        }
    })

    return {total, balances};
}

// Function that get reserve of a token inside the liquidity pool
let getReserveFromLp = (contract_state, search_denom) => {

    for (const el of contract_state) {
        var content = JSON.parse(new Buffer.from(el.value, "base64").toString());

        // get only the token we interested in
        if (content.denom?.native === search_denom) {
            return parseInt(content.reserve)
        } 
    }
}

// Function that calculates how many of a token side everybody has inside the Pool
let calculatePoolShares = (lpt_data, reserve) => {

    for (let bal of lpt_data.balances) {
        // Calculate pool share
        var tokenInPool = (bal.amount * reserve) / lpt_data.total;
        bal.tokenInPool = tokenInPool
        bal.poolShare = ((100 * bal.amount) / lpt_data.total).toFixed(12)
    }

    return lpt_data
}

let showHelp = () => {
    console.log(`Extract token amount in liquidity pool from partial state export`)
    console.log("");
    console.log("Usage: npm run juno-lp <state file> <token denom> <id> ");
    console.log("Example: npm run juno-lp ./2500000_contracts.json ujuno 1800000");
    console.log("");
}

let main = async () => {

    // Args
    var [_, _, stateFile, tokenDenom, id] = process.argv;

    if (stateFile == undefined || tokenDenom == undefined || id == undefined) {
        showHelp();
        return;
    }

    // Load snapshot
    var contracts = JSON.parse(await readFile(
        new URL(`${stateFile}`, import.meta.url)
    ))

    // Sum all pools together
    var balances = [];
    var total = 0;
    for (var pool of pools) {
        // Find contract state
        var lp_token = findContract(contracts, pool.lp);
        var lpt_data = getBalancesFromCW20State(lp_token.contract_state)

        // Get pool data
        var swap = findContract(contracts, pool.swap);
        var reserve = getReserveFromLp(swap.contract_state, tokenDenom)

        calculatePoolShares(lpt_data, reserve)

        for (var balance of lpt_data.balances) {
            var currentBal = balances.find((el) => el.address == balance.address);

            if (currentBal === undefined) {
                balances.push({
                    address: balance.address,
                    amount: parseFloat(balance.tokenInPool),
                })
            } else {
                currentBal.amount += parseFloat(balance.tokenInPool)
            }

            total += parseFloat(balance.tokenInPool);
        }
    }


    var output = {
        balances: balances,
        total: total
    };

    // Write pool data to file
    fs.writeFileSync(`./output/juno_lp/${id}.json`, JSON.stringify(output))
  
}

main();