
import { readFile } from 'fs/promises';
import * as fs from "fs"

const JUNO_DENOM = "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED";

const MODULE_ADDRESSES = [
    "osmo1njty28rqtpw6n59sjj4esw76enp4mg6g7cwrhc", // Lock module

    "osmo1tusadtwjnzzyakm94t5gjqr4dlkdcp63hctlql6xvslvkf7kkdws5lfyxc", // pool 498
    "osmo1h7yfu7x4qsv2urnkl4kzydgxegdfyjdry5ee4xzj98jwz0uh07rqdkmprr", // pool 497
    "osmo13mu0c55r8yt9mgycc7zx6jedxh73mf630xwpwvwfm7qf4q7k3edqu209ez", // other pools following
    "osmo17nsa8pa7cjeu2tj8v5mqen8cye3rrp2h69lzvepveruhvtmujkzq9uzjfw",
    "osmo1fmz4zaaj377th482zzrvc5d9rx7hpreyhfprvum9hd2vyedg0trquug78j",
    "osmo1gf86c7l352dk4zcgruldykckr99jn86khvjy2efcvevewrjkv3msxur0kp",
    "osmo13dnatwj7l5vdksrh66zqkp6pmvfdtqc8vr6m543dav6x26q6wvyqe3nmv6",
    "osmo167a9n3f6t8v64pugrqnz88f7w8tlwaxfsgge4tm7jh4gvxrhstyqgyv5jw",
    "osmo1ked4s6v8a5fnr7wshk3825c4dc44hth4aln264ygjxqw9ck4ry6qg6ysxy",
    "osmo10j25ze5tj5ryxz4jk79au6srhe62jsckk9dd6u5qt3326wv9gvnskn7tu9",
    "osmo1gtc9dqfscgnlrw73yalnan4v2fwy2hz5447sqgclx68yz46us3xs38v2eh",
    "osmo1u05s34q3hk8mu3ypw6g5eqvfdvcllck8zualccz2p75lmdnmwgaszyg9ez",
    "osmo167dycqs0n3dxzfrwctg3p4hg7zxjjptr2p7nvkk9d23wu8spy4csdzvlsx",
    "osmo1ttcpuguqnn332k8ls9pm05h7dxpejxvt47ayeyntmhlxtse0mh8s6npxfe",
    "osmo10ya3d9gr2cmp268kdu8u5mna0pktqfxkt9ug54z9xrazpk3wpj0qz9zlcg",
    "osmo1l7vu8utujujfy0j2xrhcfzcz27q85j29vxxyjx4w7lnxzsevjfwq69qxrq",
    "osmo14azf94grg0qn67tkczejnt87t9yzt5ndg5h3pqc8zapz3hpg7whq5zzsyh",
    "osmo19g97e0xshdd4xefn39wwquftq3g9u0a7jk8wcety6fgv58cpsx5sdjnvre",
    "osmo1wea46n3f86um4dp37t43pwpurcky9e7lz56tujrtcql9yx6sphtqee256z",
    "osmo1y820u9050hz23a48e7wzw5mnqftplvj205l0vaw3tx7g609l32zsxdyeam",
    "osmo1z0693astkr0t976z8fs22902qxnl8rhjw44uglll9qk07h7wpt6sy77yc7",
    "osmo1kqmrg9qyqfgkys9q892m8st5mkesez8vpnegppecex0ylqqp8h8sedeu4q",
    "osmo1hs78pxgz4v0tmqs4gau9zpdsaeu4jumkr2r7qy0v40uqnws26ussyxt7ga",
    "osmo1mel7yxyqx2n39zrw8eqrxv8gjltvlchqaycjz6gg0x8qgs7zhe9sc5gavj",
    "osmo1rz76daxyz9vhf079ahgr6l76uah9xvhe65vu8dqyf5nq7674d3yss96x7w",
    "osmo13n2p8v5w5knclf4yprk6hdrfqt3s94ynmjud7gf6djed8759qedsasl446",
    "osmo10ce9cnt6hk4jnghvdl5asdsc5rmjfswkk7u5jrfr5ecy5puvsdzs5x6rvc",
    "osmo17n6nngjwheahmljdk0k56dh5dfnktn2r2f33sdaj4uwnrk00y4vs0jcc0f",
    "osmo1z4tn4qh0dj89h5h3jyxprthh324vm88t7netqjeu6855hf7ttugqevfnew",
    "osmo1s6nlndkuna63w5kk5npduwful69urrfvdlhn74awcan2dpx43xpsr4cxf9",
    "osmo1aavgx9ta75dchrwjf46z086pcjr44t4qkvz0c7walmvf5j3lxqnsulxsfw",
    "osmo1f2tlf4lnhzsrh9pyu9y3u6wju2nlqzummm3zs70jerk2s7a0fq4qfq9epf",
    "osmo1hgxsqpxghfw7pwwl8jwxzy04cyll8nhf6ejnxpx3wvkszkq6rznqap0yuc",
    "osmo1jeku67d5x534pn4l3ules7yye2s6kkj92hmn0lyldwnv5xv6cq3qjujw5y",
    "osmo19esg8fulwzufjjarprfpu4mz06zjpkmk7p0wydcw5q900lp2k3mq7afv7m",
    "osmo1fjrk6zk2st8uzgzedh8rx9rt8gk7rmxmstr8923v0xsqn2gjafmqr99vc5",
    "osmo1zyjk6a4fapusydkauzph93h3c2ssngpfh3retatwaqw32lw20mhqcxu4xw",
    "osmo10tx2zgul27naq2p5urn9kx7lygfr0zhsk3s42nh0dcfqyudq655sadlyxj",
    "osmo1nefum67tu9gzamyzvsp960auxayp5ft3pkwey67h434nkytuys4svyml98",
    "osmo17nsa8pa7cjeu2tj8v5mqen8cye3rrp2h69lzvepveruhvtmujkzq9uzjfw",
    "osmo13mu0c55r8yt9mgycc7zx6jedxh73mf630xwpwvwfm7qf4q7k3edqu209ez",
    "osmo1tusadtwjnzzyakm94t5gjqr4dlkdcp63hctlql6xvslvkf7kkdws5lfyxc",
    "osmo1h7yfu7x4qsv2urnkl4kzydgxegdfyjdry5ee4xzj98jwz0uh07rqdkmprr",
    "osmo1mtn55pzt3huxrskm986s89e465u3kvln9uum5deeza27f0vtmucs9ysvr6"
]

let findJuno = (coinsArray) => {
    return coinsArray.find((el) => el.denom === JUNO_DENOM);
}

let showHelp = () => {
    console.log(`Extract token amount in liquidity pool from osmosis derive balance export (https://docs.osmosis.zone/integrate/airdrops.html#take-the-state-export-snapshot)`)
    console.log("");
    console.log("Usage: npm run osmosis <balances file> <output file>");
    console.log("Example: npm run osmosis ./balances.json output.json");
    console.log("");
}

let main = async () => {

      // Args
      var [_, _, balancesFile, outPutFile] = process.argv;

    // Load snapshot
    var balances = JSON.parse(await readFile(
        new URL(`${balancesFile}`, import.meta.url)
    ))


    // Extract balances and calculate total juno in pools
    var tot = 0;
    var shares = [];
    for (const [key, account] of Object.entries(balances.accounts)) {

        // Skip module addresses
        if (MODULE_ADDRESSES.indexOf(key) !== -1) {
            continue;
        }

        var addressTot = 0;
        for (const [poolID, coinsInPool] of Object.entries(account.bonded_by_select_pools)) {

            var bal = findJuno(coinsInPool);

            // no juno found
            if (bal === undefined) {
                continue;
            }
        
            addressTot += parseInt(bal.amount)
        }

        if (addressTot > 0) {

            shares.push({
                address: account.address,
                amount: addressTot
            })

            tot += addressTot;
        }
       
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