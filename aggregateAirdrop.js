import { readFile } from 'fs/promises';
import * as fs from "fs"
import { bech32 } from  'bech32'

const WHALE_CAP = 2000000000000;

const files = [
    {file: "airdrop/juno_lp_all.json", type: "juno_lp_total"},
    {file:"airdrop/juno_stakers_1.json", type: "juno_stake_1"},
    {file:"airdrop/juno_stakers_2.json", type: "juno_stake_2"},
    {file:"airdrop/osmosis_snap1.json", type: "osmosis_lp_1"},
    {file:"airdrop/osmosis_snap2.json", type: "osmosis_lp_2"}
]

let convertToMicro = (amount) => {
    return Math.floor(parseFloat(amount) * 1000000)
}

let main = async () => {


    var balances = [];

    for (var file of files) {
        // Open
        var b = JSON.parse(await readFile(
            new URL(`${file.file}`, import.meta.url)
        ))

        for (var account of b) {

            // Skip dust
            if (account.amount < 0.01) {
                continue
            }

            var address = account.address

            // Convert non juno addresses (osmosis) to juno
            if (!address.startsWith("juno")) {
                var decoded = bech32.decode(address)
                address = bech32.encode("juno", decoded.words)
            }

            // Check if address already exists
            var curAccount = balances.find((el) => el.address == address);

            if (curAccount === undefined) {
                
                balances.push({
                    address: address,
                    total_airdrop: convertToMicro(account.amount),
                    [file.type]: convertToMicro(account.amount),
                })
            } else {
                curAccount.total_airdrop += convertToMicro(account.amount)
                curAccount[file.type] = convertToMicro(account.amount)
            }

        }

       
        console.log(balances.find((el) => el.address == "juno1s33zct2zhhaf60x4a90cpe9yquw99jj0zen8pt"))
    }

    // Apply whale cap
    for (var bal of balances) {

        if (bal.total_airdrop > WHALE_CAP) {
            bal.total_airdrop = WHALE_CAP;
        }
    }

    fs.writeFileSync("all_airdrop.json", JSON.stringify(balances))
}

main();
