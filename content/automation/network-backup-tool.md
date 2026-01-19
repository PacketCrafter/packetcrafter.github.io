---
title: "Operationalizing Network Backups: SolarWinds Kiwi CatTools Implementation"
date: 2024-03-20
description: "Configuring and programming Kiwi CatTools for automated Juniper/Cisco backups and reporting."
summary: "Revitalized dormant software assets by programming Kiwi CatTools to automate configuration backups and email reporting for campus-wide network infrastructure."
tags: ["SolarWinds", "CatTools", "Network Administration", "Juniper", "Automation"]
---

### Project Overview
[cite_start]At the University of Texas at San Antonio, I identified an underutilized instance of **SolarWinds Kiwi CatTools**[cite: 21, 23]. While the university owned the license, the tool had never been programmed to interface with the production environment. I took ownership of the platform to architect a hands-off backup and notification system.

### Engineering Tasks
* [cite_start]**Device Integration:** Configured SSH/Telnet communication profiles for Juniper routers and switches, ensuring secure access to configuration files[cite: 22, 23].
* [cite_start]**Job Programming:** Scripted the "Device.Backup.Running Config" activities to run on a set rotation, ensuring zero manual intervention was required for disaster recovery preparedness[cite: 22, 23].
* [cite_start]**SMTP Orchestration:** Programmed automated email triggers to provide the engineering team with "Success/Failure" reports upon completion of every backup cycle[cite: 27, 21].
* [cite_start]**Inventory Management:** Centralized the storage of configuration files, allowing for rapid diff-checking and historical auditing of network changes[cite: 39, 45].

### Technical Architecture
The implementation ensures that any change made to the core or edge infrastructure is captured and the team is notified immediately:

```mermaid
graph TD
    A[Kiwi CatTools Scheduler] --> B{Programmed Activities}
    B -->|SSH| C[Juniper Switches/Routers]
    B -->|SSH| D[Cisco Infrastructure]
    C & D --> E[Secure Config Repository]
    E --> F[Automated Email Notification]
    F --> G[Network Engineering Team]
    style A fill:#005a9c,color:#fff
    style F fill:#f96,stroke:#333
