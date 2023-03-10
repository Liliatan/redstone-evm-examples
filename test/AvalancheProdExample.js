const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");
const { REDSTONE_MARKER_HEX } = require("redstone-protocol/dist/src/common/redstone-constants");
const { expect } = require("chai");

const redstoneCacheLayerUrls = [
  "https://oracle-gateway-1.a.redstone.finance",
  "https://oracle-gateway-2.a.redstone.finance",
];

describe("AvalancheProdExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const AvalancheProdExample = await ethers.getContractFactory("AvalancheProdExample");
    contract = await AvalancheProdExample.deploy();
  });

  it("Get AVAX price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount: 3,
      dataFeeds: ["AVAX"],
      // disablePayloadsDryRun: true
    }, redstoneCacheLayerUrls);

    // Interact with the contract (getting oracle value securely)
    const avaxPriceFromContract = await wrappedContract.getLatestAvaxPrice();
    console.log({ avaxPriceFromContract });
  });

  it("Get price for AVAX, ETH, and PNG in the same call (several data feeds specified)", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount: 3,
      dataFeeds: ["AVAX", "ETH", "PNG"],
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssets(ids);
    console.log(prices);
  });

  it("Get price for AVAX, ETH, and PNG in the same call (no data feeds specified)", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount: 3,
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssets(ids);
    console.log(prices);
  });

  it("Get price for AVAX, ETH, and PNG in the same call (with dupliates)", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount: 3,
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG", "ETH", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssetsWithDuplicates(ids);
    console.log(prices);
  });

  it("Should populate transaction", async () => {
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount: 3,
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const tx = await wrappedContract.populateTransaction.getLatestPricesForManyAssets(ids);
    const redstoneMarker = REDSTONE_MARKER_HEX.replace("0x", "");
    expect(tx.data)
      .to.be.a("string")
      .and.satisfy((str) => str.endsWith(redstoneMarker));
  })
});
