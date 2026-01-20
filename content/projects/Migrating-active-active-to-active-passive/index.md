---
title: "Deterministic High Availability: Migrating from Active/Active to Active/Passive"
date: 2026-01-19
draft: false
description: "A technical deep-dive into re-architecting firewall high availability for stability and predictable failover."
tags: ["Palo Alto Networks", "Network Security", "High Availability", "Automation"]
series: ["Infrastructure Migrations"]
showTaxonomies: true
---

## Overview
As the lead engineer for this migration, I transitioned our core perimeter security from an **Active/Active (A/A)** cluster to an **Active/Passive (A/P)** configuration. While A/A is often marketed for "performance," modern network requirements for stateful inspection and deterministic routing often favor the simplicity of A/P.

## Understanding the Architectures

### Active/Active (The Complexity)
In an A/A setup, both firewalls pass traffic simultaneously. 
* **Pros:** Real-time session synchronization; maximum utilization of hardware.
* **Cons:** Highly susceptible to **Asymmetric Routing**. If a packet enters Node A but the return packet hits Node B, the session state must be shared across the HA3 link, introducing latency and complexity.

### Active/Passive (The Standard)
In an A/P setup, only the "Active" node processes traffic, while the "Passive" node remains in a standby state, synchronized and ready to take over.
* **Pros:** Deterministic traffic flow, simpler troubleshooting, and no risk of session-sharing latency.
* **Cons:** One unit is technically "idling" during normal operations.



## The Migration Strategy
To transition the Palo Alto cluster without significant downtime, we followed a structured cutover process:

### 1. Pre-Migration Logic
We utilized the **Floating IP** concept. In A/P, the virtual IP moves between hardware during failover, ensuring the upstream and downstream neighbors see no change in Gateway MAC addresses.

### 2. Implementation Steps
1.  **Backup:** Exported the current `running-config.xml` and created a named snapshot.
2.  **HA Reconfiguration:** Modified the HA settings under `Device > High Availability`.
3.  **Path Monitoring:** Configured Path and Link monitoring to ensure failover triggers accurately if a physical link or upstream gateway becomes unreachable.
4.  **The Cutover:**
    * Suspended the secondary node.
    * Changed HA mode to Active/Passive on the primary.
    * Reconfigured the secondary node and rejoined the cluster.

## Network Topology (Mermaid)

```mermaid
graph TD
    subgraph "External Transit"
    ISP_Router[ISP Router]
    end

    subgraph "High Availability Cluster"
    FW_A[Firewall A - Active]
    FW_B[Firewall B - Passive]
    FW_A ---|HA1/HA2 Sync| FW_B
    end

    subgraph "Internal Network"
    Core_Switch[Core L3 Switch]
    end

    ISP_Router --- FW_A
    FW_A --- Core_Switch
    FW_B -.->|Standby Link| Core_Switch
---
title: "Deterministic High Availability: Migrating from Active/Active to Active/Passive"
date: 2026-01-19
draft: false
description: "A technical deep-dive into re-architecting firewall high availability for stability and predictable failover."
tags: ["Palo Alto Networks", "Network Security", "High Availability", "Automation"]
#series: ["Infrastructure Migrations"]
showTaxonomies: true
---

## Overview
As the lead engineer for this migration, I transitioned our core perimeter security from an **Active/Active (A/A)** cluster to an **Active/Passive (A/P)** configuration. While A/A is often marketed for "performance," modern network requirements for stateful inspection and deterministic routing often favor the simplicity of A/P.

## Understanding the Architectures

### Active/Active (The Complexity)
In an A/A setup, both firewalls pass traffic simultaneously. 
* **Pros:** Real-time session synchronization; maximum utilization of hardware.
* **Cons:** Highly susceptible to **Asymmetric Routing**. If a packet enters Node A but the return packet hits Node B, the session state must be shared across the HA3 link, introducing latency and complexity.

### Active/Passive (The Standard)
In an A/P setup, only the "Active" node processes traffic, while the "Passive" node remains in a standby state, synchronized and ready to take over.
* **Pros:** Deterministic traffic flow, simpler troubleshooting, and no risk of session-sharing latency.
* **Cons:** One unit is technically "idling" during normal operations.



## The Migration Strategy
To transition the Palo Alto cluster without significant downtime, we followed a structured cutover process:

### 1. Pre-Migration Logic
We utilized the **Floating IP** concept. In A/P, the virtual IP moves between hardware during failover, ensuring the upstream and downstream neighbors see no change in Gateway MAC addresses.
### 2. Implementation Steps
1.  **Backup:** Exported the current `running-config.xml` and created a named snapshot.
2.  **HA Reconfiguration:** Modified the HA settings under `Device > High Availability`.
3.  **Path Monitoring:** Configured Path and Link monitoring to ensure failover triggers accurately if a physical link or upstream gateway becomes unreachable.
4.  **The Cutover:**
    * Suspended the secondary node.
    * Changed HA mode to Active/Passive on the primary.
    * Reconfigured the secondary node and rejoined the cluster
