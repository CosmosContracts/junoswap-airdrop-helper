#/bin/bash

for i in {0..89}
do
   block=$((1800000+$i*10000)) 
   npm run juno-lp snapshots/juno/contracts/$block.json ujuno $block
   echo "$block fatto"
done
