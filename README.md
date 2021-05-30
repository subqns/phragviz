# Sequential Phragmén Explorable Explanation

This is an [explorable explanation](https://explorabl.es/) of the Sequential [Phragmén voting system](https://en.wikipedia.org/wiki/Lars_Edvard_Phragm%C3%A9n) (invented in the 1890s) currently used on [Kusama](http://kusama.network/) and [Polkadot's](http://polkadot.network/) on-chain elections. You can create candidates and voters, adjust their voting stake (drag left and right or type) and add and delete votes to see how it affects the results.

The code is based on the [Python reference implementation](https://github.com/w3f/consensus/tree/master/NPoS)

* [Try it here](https://playing-with-dust.github.io/phragviz/)

## Todo:

- Explain loads and scores per round
- Add conviction to votes
- Figure out ordered votes for council elections
- Simplified/complicated views
- Import on-chain election results

## Building

    $ npm install
    $ browserify -p esmify src/index.js -o bundle.js

