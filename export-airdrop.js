import { readFile } from 'fs/promises';
import * as fs from "fs"

const CUSTODIAL_ADDRESSES = [
    "juno1aeh8gqu9wr4u8ev6edlgfq03rcy6v5twfn0ja8", // CCN
 ]

let allocateProportionally = async (fileName, tokenToAllocate) => {
    var balances = [];

    // Open file
    var input = null;
    
    if (typeof fileName === 'string' || fileName instanceof String) {
        input = JSON.parse(await readFile(
            new URL(fileName, import.meta.url)
        ))
    } else {
        input = fileName;
    }

    for (var account of input.balances) {
        // Calculate how much airdrop
        // amount input : total input = x ; tokenToAllocate

        if (account.address === "juno1jv65s3grqf6v6jl3dp4t6c9t9rk99cd83d88wr") {
            console.log("pisello")
            console.log(account)
            console.log(tokenToAllocate)
            console.log(input)
        }

        balances.push({
            address: account.address,
            amount: (account.amount * tokenToAllocate) / input.total
        })
    }

    return balances
}

var main = async () => {


    // Load configuration
    var input_list = JSON.parse(await readFile(
        new URL(`input_list.json`, import.meta.url)
    ))

    for (var input of input_list) {

        switch (input.type) {

            case "osmosis-lp":
                continue;
                console.log("Osmosis lp calculation")
                var balances = await allocateProportionally(input.file, input.allocation)
                fs.writeFileSync(input.output, JSON.stringify(balances))
            break;
            case "juno-stakers":
                continue;
                var balances = await allocateProportionally(input.file, input.allocation)
                fs.writeFileSync(input.output, JSON.stringify(balances))
            break;
            case "juno-lp":

            var totalPoints = [];
            var tot = 0;
            for (var snap of input.snaps) {

                console.log(`Calculating snap ${snap.id}`)
                var points = await allocateProportionally(`./output/juno_lp/${snap.id}.json`, snap.points)

                for (var point of points) {
                    var addr = point.address;


                    // Send to community pool custodial addresses
                    if (CUSTODIAL_ADDRESSES.indexOf(addr) !== -1) {
                        addr = "juno1jv65s3grqf6v6jl3dp4t6c9t9rk99cd83d88wr"
                    }

                    var currentPoints = totalPoints.find((el) => el.address == addr);

                    if (currentPoints === undefined) {
                        totalPoints.push({
                            address: addr,
                            amount: parseFloat(point.amount)
                        })
                    } else {
                        currentPoints.amount += parseFloat(point.amount)
                    }

                    tot += parseFloat(point.amount)
                }

                console.log(`Fatto snap ${snap.id}, tot ${tot}`)
            }

            fs.writeFileSync("pippo.json", JSON.stringify(totalPoints))
            var lpAirdrop = await allocateProportionally({balances: totalPoints, total: tot}, input.allocation)
            fs.writeFileSync(`airdrop/juno_lp_all.json`, JSON.stringify(lpAirdrop))

            //     var totalJuno = []
            //     var tot = 0;
            //     for (var pool of input.pools) {
            //         console.log(`opening ./output/juno_lp/${snap.id}_${pool}.json`)
            //         // Open snap
            //         var poolBalances = JSON.parse(await readFile(
            //             new URL(`./output/juno_lp/${snap.id}_${pool}.json`, import.meta.url)
            //         ))

            //         for (var poolBal of poolBalances.balances) {

            //             var currentBal = totalJuno.find((el) => el.address == poolBal.address);

            //             if (currentBal === undefined) {
            //                 totalJuno.push({
            //                     address: poolBal.address,
            //                     amount: parseInt(poolBal.amount),
            //                 })
            //             } else {
            //                 currentBal.amount += parseInt(poolBal.amount)
            //             }

            //             tot += parseInt(poolBal.amount)
            //         }
            //     }

            //     // Calculate allocation
            //     var points = await allocateProportionally({balances: totalJuno, total: tot}, snap.points)
            //     fs.writeFileSync(`${input.output_folder}/juno_lp_${snap.id}.json`, JSON.stringify(points))
            // }
                
            break;
            default: 
                console.log(`${input.type} type not found`)
        }
    }
}

main()



