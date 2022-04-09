# JunoSwap Airdrop Helper

Set of toolings to simplify extracting data from JunoSwap Liquidity Pools and facilitate the creation of airdrops. 


## Preparing snapshot

Data can be decoded from a state-export of any Cosmos Chain with CosmWasm module enabled and it has been tested on Juno. Since full state exports are ofter too large to be read easily from javascript we need to extract only the parts we need first. To do so you can use the follwing commands as an example

```
junod export --height 2500000 2> snap_2500000.json 
cat snap_2500000.json | jq .app_state.wasm.contracts > 2500000_contracts.json 
```

Once you have contract state in an easy json format you can start using the scripts.