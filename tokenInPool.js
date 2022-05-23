import { fromHex } from "@cosmjs/encoding";
import { readFile } from 'fs/promises';
import * as fs from "fs"

let findContract = (contracts, address) => {
   return contracts.find((el) => el.contract_address === address);
}


let mergeBalances = (balances, stakes) => {
    for (const bal of stakes) {
        var current = balances.find((el) => el.address === bal.address);

        if (current === undefined) {
            balances.push(bal)
        } else {
            current.amount += bal.amount
        }
    }

    return balances
}

let getStakingBalances = (contract_state) => {

    const balances = []
    let total = 0;

    // Iterate balances
    contract_state.forEach((el) => {
        // decode key (if anyone know a better way to do this please send a PR)
        var keyBytes = fromHex(el.key.substring(4));
        var decoded = new Buffer.from(keyBytes).toString();

        if (decoded.startsWith("claims") || decoded.startsWith("staked_balances")) {

            // separate address
            var address = decoded.startsWith("claims") ? decoded.substring(6) : decoded.substring(15) 

            var balance = 0;
            
            if (decoded.startsWith("claims")) {
                balance = parseInt(JSON.parse(new Buffer.from(el.value, "base64").toString())[0].amount)
            } else {
                // Decode balance
                balance = parseInt(new Buffer.from(el.value, "base64").toString().replace('"', ""))
            }
           
       
               // console.log(`Balance ${address}: ${parseInt(balance)}`)

            if (address === "juno1wk3n0j2chkwn66r846gpv6dpeuwef9v67jqrjw") {
                console.log(`Balance ${address}: ${parseInt(balance)}`)
            }
            if (balance > 0) {
                balances.push({
                    address: address,
                    balance: balance
                })
            
                total += balance; // this could be get also from token_info.total_supply but I'm lazy
            }
        }
    })

    return {total, balances};
}

// function that extract all balances from a CW20 contract (LP Token)
let getBalancesFromCW20State = (contract_state, stakingContractAddress) => {

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

            // skip staking contract
            if (address === stakingContractAddress) {
                return;
            }

            // Decode balance
            var balance = parseInt(new Buffer.from(el.value, "base64").toString().replace('"', ""))
            // console.log(`Balance ${address}: ${parseInt(balance)}`)

            if (balance > 0) {
                balances.push({
                    address: address,
                    balance: balance
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
        var tokenInPool = (bal.balance * reserve) / lpt_data.total;
        bal.tokenInPool = tokenInPool
        bal.poolShare = ((100 * bal.balance) / lpt_data.total).toFixed(12)
    }

    return lpt_data
}

let showHelp = () => {
    console.log(`Extract token amount in liquidity pool from partial state export`)
    console.log("");
    console.log("Usage: npm run tokenInPool <state file> <lp token> <swap contract> <staking contract> <token denom> <output file>");
    console.log("Example: npm run tokenInPool ./2500000_contracts.json juno18ckrreffz9jwmkw84axsvncexfqt7gpgckskk0yy0vzwm9huqkyq6v78xu juno1sg6chmktuhyj4lsrxrrdflem7gsnk4ejv6zkcc4d3vcqulzp55wsf4l4gl juno1qqyyw94fxdrvkyrf84a8603jpj3keva5hsqgqunhan0kqtgqaf4qr8rxss ujuno juno_atom.json");
    console.log("");
}

let main = async () => {

    // Args
    var [_, _, stateFile, lpTokenAddress, swapContractAddress, stakingContractAddress, tokenDenom, outPutFile] = process.argv;

    if (stateFile == undefined || lpTokenAddress == undefined || swapContractAddress == undefined || stakingContractAddress == undefined
         || tokenDenom == undefined || outPutFile == undefined) {
        showHelp();
        return;
    }

    // Load snapshot
    var contracts = JSON.parse(await readFile(
        new URL(`${stateFile}`, import.meta.url)
    ))

    // find staking contract state
    var staking_contract = findContract(contracts, stakingContractAddress);
    var staking_balances = getStakingBalances(staking_contract.contract_state);

    // Find contract state
    var lp_token = findContract(contracts, lpTokenAddress, stakingContractAddress);
    var lpt_data = getBalancesFromCW20State(lp_token.contract_state)

    // Merge staking balances 
    var lp_balances = mergeBalances(lpt_data.balances, staking_balances.balances)

    // Get pool data
    var swap = findContract(contracts, swapContractAddress);
    var reserve = getReserveFromLp(swap.contract_state, tokenDenom)

    calculatePoolShares({total: lpt_data.total + staking_balances.total, balances: lp_balances}, reserve)

    // Write pool data to file
    fs.writeFileSync(outPutFile, JSON.stringify(lpt_data))
}

main();