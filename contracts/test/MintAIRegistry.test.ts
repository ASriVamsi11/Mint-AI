import { expect } from "chai";
import { ethers } from "hardhat";

describe("MintAIRegistry", () => {
  async function deploy() {
    const [admin, agent, recorder, outsider] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("MintAIRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    return { registry, admin, agent, recorder, outsider };
  }

  it("registers an agent and seeds reputation at 500", async () => {
    const { registry, agent } = await deploy();
    await registry.connect(agent).registerAgent("MintAI-Genesis");

    const data = await registry.getAgent(agent.address);
    expect(data.name).to.equal("MintAI-Genesis");
    expect(data.active).to.equal(true);
    expect(await registry.reputation(agent.address)).to.equal(500);
    expect(await registry.getAgentCount()).to.equal(1);
  });

  it("rejects double registration", async () => {
    const { registry, agent } = await deploy();
    await registry.connect(agent).registerAgent("MintAI-Genesis");
    await expect(
      registry.connect(agent).registerAgent("MintAI-Other"),
    ).to.be.revertedWith("MintAI: already registered");
  });

  it("appends memory anchors and exposes them as history", async () => {
    const { registry, agent } = await deploy();
    await registry.connect(agent).registerAgent("MintAI-Genesis");
    await registry.connect(agent).anchorMemory("bafybeiabc", 7);
    await registry.connect(agent).anchorMemory("bafybeidef", 10);

    expect(await registry.getMemoryHistoryLength(agent.address)).to.equal(2);
    const history = await registry.getMemoryHistory(agent.address);
    expect(history[0].cid).to.equal("bafybeiabc");
    expect(history[0].entryCount).to.equal(7);
    expect(history[1].cid).to.equal("bafybeidef");
    expect(history[1].entryCount).to.equal(10);
  });

  it("records per-service stats and totals correctly", async () => {
    const { registry, agent, admin } = await deploy();
    await registry.connect(agent).registerAgent("MintAI-Genesis");

    // admin is the default recorder
    await registry.connect(admin).recordService(agent.address, 0, 10_000); // analyze $0.01
    await registry.connect(admin).recordService(agent.address, 1, 5_000);  // generate $0.005
    await registry.connect(admin).recordService(agent.address, 2, 20_000); // predict $0.02

    const s = await registry.stats(agent.address);
    expect(s.analyzeRequests).to.equal(1);
    expect(s.generateRequests).to.equal(1);
    expect(s.predictRequests).to.equal(1);
    expect(s.analyzeEarningsMicro).to.equal(10_000);
    expect(s.generateEarningsMicro).to.equal(5_000);
    expect(s.predictEarningsMicro).to.equal(20_000);

    expect(await registry.totalRequests(agent.address)).to.equal(3);
    expect(await registry.totalEarningsMicro(agent.address)).to.equal(35_000);
  });

  it("blocks non-recorders from recording service calls", async () => {
    const { registry, agent, outsider } = await deploy();
    await registry.connect(agent).registerAgent("MintAI-Genesis");
    await expect(
      registry.connect(outsider).recordService(agent.address, 0, 10_000),
    ).to.be.revertedWith("MintAI: not recorder");
  });

  it("lets admin grant a new recorder", async () => {
    const { registry, agent, recorder, admin } = await deploy();
    await registry.connect(agent).registerAgent("MintAI-Genesis");

    await registry.connect(admin).grantRecorder(recorder.address);
    await registry.connect(recorder).recordService(agent.address, 0, 10_000);

    const s = await registry.stats(agent.address);
    expect(s.analyzeRequests).to.equal(1);
  });

  it("only admin can set reputation, capped at 1000", async () => {
    const { registry, agent, admin, outsider } = await deploy();
    await registry.connect(agent).registerAgent("MintAI-Genesis");

    await registry.connect(admin).setReputation(agent.address, 750);
    expect(await registry.reputation(agent.address)).to.equal(750);

    await expect(
      registry.connect(outsider).setReputation(agent.address, 800),
    ).to.be.revertedWith("MintAI: not admin");
    await expect(
      registry.connect(admin).setReputation(agent.address, 1500),
    ).to.be.revertedWith("MintAI: score > 1000");
  });

  it("rejects anchorMemory from unregistered agents", async () => {
    const { registry, outsider } = await deploy();
    await expect(
      registry.connect(outsider).anchorMemory("bafy", 1),
    ).to.be.revertedWith("MintAI: agent not registered");
  });
});
