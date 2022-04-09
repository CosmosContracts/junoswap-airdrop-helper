# JunoSwap Airdrop Helper

Set of toolings to simplify extracting data from JunoSwap Liquidity Pools and facilitate the creation of airdrops. 


## Preparing snapshot

Data can be decoded from a state-export of any Cosmos Chain with CosmWasm module enabled and it has been tested on Juno. Since full state exports are ofter too large to be read easily from javascript we need to extract only the parts we need first. To do so you can use the follwing commands as an example

```
junod export --height 2500000 2> snap_2500000.json 
cat snap_2500000.json | jq .app_state.wasm.contracts > 2500000_contracts.json 
```

Once you have contract state in an easy json format you can start using the scripts.


## Exctract token balance from JunoSwap

Command
```
npm run tokenInPool <state file> <lp token> <swap contract> <token denom> <output file>
```

Example
```
npm run tokenInPool ./2500000_contracts.json juno18ckrreffz9jwmkw84axsvncexfqt7gpgckskk0yy0vzwm9huqkyq6v78xu juno1sg6chmktuhyj4lsrxrrdflem7gsnk4ejv6zkcc4d3vcqulzp55wsf4l4gl ujuno juno_atom.json
```

Output (truncated)
```json
{
    "balances": [
        {
            "address": "juno1000fwt3k6p3m55sdk0aeut4wmnhnpcus9zxddr",
            "balance": 2679752,
            "tokenInPool": 1819833.7270461952
        },
        {
            "address": "juno1004hu5jffyaskl24a4rlxcrexl4zevlssgdx8p",
            "balance": 374315,
            "tokenInPool": 254199.29215065297
        }
    ],
    "total": 472385654736
}
```