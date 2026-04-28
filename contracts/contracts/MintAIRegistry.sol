// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MintAIRegistry
/// @notice On-chain identity, memory anchor history, and per-service earnings for MintAI agents.
/// @dev Differs from a single-CID registry by maintaining append-only memory history and
///      per-service request/earning breakdowns. Access uses an admin + recorders model so
///      multiple servers can record earnings without redeploying.
contract MintAIRegistry {
    enum ServiceKind { Analyze, Generate, Predict }

    struct Agent {
        address wallet;
        string name;
        uint64 registeredAt;
        bool active;
    }

    struct MemoryAnchor {
        string cid;
        uint64 timestamp;
        uint32 entryCount;
    }

    struct ServiceStats {
        uint64 analyzeRequests;
        uint64 analyzeEarningsMicro;
        uint64 generateRequests;
        uint64 generateEarningsMicro;
        uint64 predictRequests;
        uint64 predictEarningsMicro;
    }

    address public admin;
    mapping(address => bool) public earningsRecorders;

    mapping(address => Agent) public agents;
    mapping(address => MemoryAnchor[]) private memoryHistory;
    mapping(address => ServiceStats) public stats;
    mapping(address => uint16) public reputation; // 0..1000

    address[] public allAgents;

    event AgentRegistered(address indexed agent, string name, uint64 timestamp);
    event MemoryAnchored(address indexed agent, string cid, uint32 entryCount, uint64 timestamp);
    event ServiceRecorded(address indexed agent, ServiceKind kind, uint64 amountMicro);
    event ReputationSet(address indexed agent, uint16 newScore);
    event RecorderGranted(address indexed who);
    event RecorderRevoked(address indexed who);
    event AdminTransferred(address indexed from, address indexed to);

    modifier onlyAdmin() {
        require(msg.sender == admin, "MintAI: not admin");
        _;
    }

    modifier onlyRecorder() {
        require(earningsRecorders[msg.sender] || msg.sender == admin, "MintAI: not recorder");
        _;
    }

    modifier onlyRegistered(address who) {
        require(agents[who].active, "MintAI: agent not registered");
        _;
    }

    constructor() {
        admin = msg.sender;
        earningsRecorders[msg.sender] = true;
        emit RecorderGranted(msg.sender);
    }

    /// @notice Self-register the calling wallet as an agent with the given display name.
    function registerAgent(string calldata name) external {
        require(!agents[msg.sender].active, "MintAI: already registered");
        require(bytes(name).length > 0 && bytes(name).length <= 64, "MintAI: name length");

        agents[msg.sender] = Agent({
            wallet: msg.sender,
            name: name,
            registeredAt: uint64(block.timestamp),
            active: true
        });
        reputation[msg.sender] = 500;
        allAgents.push(msg.sender);

        emit AgentRegistered(msg.sender, name, uint64(block.timestamp));
    }

    /// @notice Append a Filecoin/IPFS memory anchor for the calling agent.
    /// @dev History is append-only — every flush is preserved on-chain.
    function anchorMemory(string calldata cid, uint32 entryCount) external onlyRegistered(msg.sender) {
        require(bytes(cid).length > 0, "MintAI: cid required");
        require(entryCount > 0, "MintAI: entryCount > 0");

        memoryHistory[msg.sender].push(MemoryAnchor({
            cid: cid,
            timestamp: uint64(block.timestamp),
            entryCount: entryCount
        }));

        emit MemoryAnchored(msg.sender, cid, entryCount, uint64(block.timestamp));
    }

    /// @notice Record a paid service call for an agent (per-service breakdown).
    /// @param agent The agent that earned the payment.
    /// @param kind  Which service was invoked.
    /// @param amountMicro Amount earned in micro-USD (1_000_000 == $1.00).
    function recordService(address agent, ServiceKind kind, uint64 amountMicro)
        external
        onlyRecorder
        onlyRegistered(agent)
    {
        ServiceStats storage s = stats[agent];
        if (kind == ServiceKind.Analyze) {
            s.analyzeRequests += 1;
            s.analyzeEarningsMicro += amountMicro;
        } else if (kind == ServiceKind.Generate) {
            s.generateRequests += 1;
            s.generateEarningsMicro += amountMicro;
        } else {
            s.predictRequests += 1;
            s.predictEarningsMicro += amountMicro;
        }
        emit ServiceRecorded(agent, kind, amountMicro);
    }

    /// @notice Admin-only: set an agent's reputation score (0-1000).
    function setReputation(address agent, uint16 score) external onlyAdmin onlyRegistered(agent) {
        require(score <= 1000, "MintAI: score > 1000");
        reputation[agent] = score;
        emit ReputationSet(agent, score);
    }

    function grantRecorder(address who) external onlyAdmin {
        require(who != address(0), "MintAI: zero addr");
        earningsRecorders[who] = true;
        emit RecorderGranted(who);
    }

    function revokeRecorder(address who) external onlyAdmin {
        earningsRecorders[who] = false;
        emit RecorderRevoked(who);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "MintAI: zero addr");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    // ─── Views ────────────────────────────────────────────────────────────

    function getAgent(address agent) external view returns (Agent memory) {
        return agents[agent];
    }

    function getMemoryHistory(address agent) external view returns (MemoryAnchor[] memory) {
        return memoryHistory[agent];
    }

    function getMemoryAnchor(address agent, uint256 index) external view returns (MemoryAnchor memory) {
        require(index < memoryHistory[agent].length, "MintAI: index out of bounds");
        return memoryHistory[agent][index];
    }

    function getMemoryHistoryLength(address agent) external view returns (uint256) {
        return memoryHistory[agent].length;
    }

    function getAllAgents() external view returns (address[] memory) {
        return allAgents;
    }

    function getAgentCount() external view returns (uint256) {
        return allAgents.length;
    }

    function totalRequests(address agent) external view returns (uint256) {
        ServiceStats memory s = stats[agent];
        return uint256(s.analyzeRequests) + uint256(s.generateRequests) + uint256(s.predictRequests);
    }

    function totalEarningsMicro(address agent) external view returns (uint256) {
        ServiceStats memory s = stats[agent];
        return uint256(s.analyzeEarningsMicro) + uint256(s.generateEarningsMicro) + uint256(s.predictEarningsMicro);
    }
}
