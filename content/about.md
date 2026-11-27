---
title: "About Me"
description: "Isaias Luna - Enterprise DevOps Network Engineer"
layout: "profile"
showDate: false
showReadingTime: false
showTaxonomies: false
---

### Professional Summary
I'm an Enterprise Network DevOps Engineer based in San Antonio, TX, working at the intersection of network engineering, security, and automation. My background started in traditional network operations — wireless and switching deployments, firewall administration, data-center support — and has grown over the past few years into architecture-level and API-driven work: building infrastructure-as-code pipelines against Ansible and GitLab, automating against the Juniper Apstra and Mist APIs, and owning firewall and load-balancer lifecycle end to end. I like taking on the kind of work that replaces a manual, error-prone process with something tested, auditable, and repeatable, while still being comfortable leading a 2 a.m. maintenance window or a hardware RMA when production is on the line.

**Focus areas:** Network Automation · Data Center Networking · Palo Alto · F5 BIG-IP · Juniper Mist/QFX/EX/Apstra · Ansible · GitLab · BGP/OSPF · Network Modernization

### Core Technical Stack
* **Network & Automation:** Python, Red Hat Ansible Automation Platform, GitLab, REST APIs, Juniper Mist/Apstra, BGP EVPN/VXLAN, Infrastructure as Code.
* **Security & Firewalls:** Palo Alto Networks (Panorama, PAN-OS, GlobalProtect), Cisco ISE, Fortinet, IPSEC VPNs, security/NAT policy, application filtering.
* **Data Center & Load Balancing:** F5 BIG-IP, Juniper QFX/EX switching, Infoblox DNS/DHCP/IPAM, high-availability design.
* **Protocols:** BGP, OSPF, EVPN-VXLAN, VoIP, wired/wireless LAN/WAN troubleshooting.

### Professional Experience

**DevOps Network Engineer** · University of Texas at San Antonio · *February 2023 – Present*

*2023 — Campus Network & Wireless Modernization*
* Supported a major campus wireless and switching modernization effort spanning hundreds of access points and switches across multiple UTSA buildings — including a first wireless phase of 400 APs plus 100 additional access points, hardware staging, Mist onboarding, and Infoblox/Forescout integration.
* Contributed to an outdoor wireless deployment covering roughly 100 outdoor access points, handling PoE requirements, switch-port configuration, and IPAM/NAC integration.
* Supported migrating UTSA's remote-access VPN architecture to Palo Alto GlobalProtect, including SAML/SSO integration, certificate migration, and F5 load-balancing dependencies.

*2024 — Network DevOps, F5 & Firewall Engineering*
* Developed Python/Ansible automation for IP, DNS, DHCP, and firmware operations, and built a Python-based bulk access-point renaming workflow with rollback/audit controls, automating 500+ Juniper Mist AP renames across multiple campus buildings.
* Built a campus-wide IP-CLOS architecture on Juniper Mist BGP EVPN/VXLAN, modernizing 500+ access points and edge switches onto Juniper EX4400 Access/QFX5700 Core switches and Mist AP47s.
* Led border firewall modernization (PA-5260 → PA-5440) with active/passive HA, hardware RMA coordination, and a data-center relocation completed with zero reported service impact.
* Managed security posture via Palo Alto Panorama; migrated firewalls from Fortinet/Juniper SRX to Palo Alto and led emergency PAN-OS patching across three data-center sites for a critical CVE.
* Upgraded 5 enterprise F5 BIG-IP HA pairs to a current release using Ansible automation.
* Migrated legacy NAC policies to Cisco ISE and deployed 802.1X across Mist enterprise environments.
* Implemented a routed data-center management network, migrating UPS, PDU, and environmental-management infrastructure from Layer-2-only to routable connectivity.

*2025 — Security Response & Platform Modernization*
* Participated in emergency remediation of a critical Palo Alto CVE, coordinating PAN-OS patching across three data-center firewall sites following interim ACL mitigations.
* Developed a detailed migration and validation strategy for a further PA-5260 → PA-5440 firewall transition — Panorama staging, configuration backups, BGP/OSPF validation, failover/failback testing, and rollback readiness.
* Supported F5 BIG-IP platform migration toward the 17.x release line, including firmware staging, certificate checks, and application validation.
* Served as an escalation point for application/load-balancer incidents, isolating a production issue to a missing application-endpoint port rather than the F5 tier.
* Supported network integration for a large ClearPass NAC deployment across multiple administrative and policy-service nodes, validating VLAN/subnet assignments.

*2026 (YTD) — Automation, Architecture & API-Driven Engineering*
* Expanded network automation into Python/API-driven infrastructure engineering, building workflows against the Juniper Apstra API to extract and normalize blueprint and device-inventory data across multiple data-center fabrics — one blueprint alone yielding 341 normalized device records.
* Built F5 certificate automation through Ansible, and developed automation workflows spanning Ansible, Python, REST APIs, and GitLab across F5, Infoblox, Mist, and Apstra.
* Built a refined Python-based Juniper Mist AP bulk-renaming tool with dry-run mode, secure token handling, and rollback/audit CSV output — processing 246 AP renames across three campus buildings.
* Participated in UTSA's emergency response to a university-wide certificate trust-chain issue, identifying affected infrastructure and application certificates and helping transition impacted services to a new certificate authority.

**Network Design Engineer** · Endeavor Managed Services · *August 2022 – February 2023*
* Created design workbooks, network design outlines, and high-/low-level diagrams.
* Worked an international migration project spanning SD-WAN device installs, firewall rule modifications, and switch/route configuration — including on-site travel to assist client data centers overseas.
* Worked across Checkpoint, Fortinet, and Forcepoint firewalls, Cisco and Meraki infrastructure, and PRTG monitoring; provided daily project updates to clients and third-party vendors.

**Network Engineer II** · Deltra Systems LLC · *April 2021 – August 2022*
* Configured and managed next-generation FortiGate firewalls — web/content filtering, AV profiles, SSL inspection, application control, IPS, and SSL/IPSEC VPNs.
* Supported federal and state IT examination audits (FDIC, OCC, Texas Department of Banking) and performed recurring firmware upgrades, config backups, and network documentation.

**Network Administrator** · Diamond Resorts International · *December 2019 – April 2021*
* Provided operational support for a global data/voice network environment, managing firewall policy across resorts and data centers and maintaining security and inventory documentation.

**NOC Technician** · Presidio · *December 2017 – December 2019*
* Monitored and managed network, data center, security, and voice technologies across Cisco, VMware, Palo Alto, Juniper, F5, HP, and NetApp platforms, escalating and driving incidents to resolution with engineering teams and vendors.

### Education
* **University of Maryland Global Campus** — B.S., Computer Network and Cybersecurity
* **Montgomery College** — A.A.S., Cybersecurity

### Certifications
* Red Hat Certified Specialist in Developing Automation with Ansible Automation Platform
* Juniper Networks Certified Specialist (JNCIS-ENT)
* Cisco Certified Network Associate (CCNA)
* ISC2 Certified in Cybersecurity (CC)
* CompTIA Security+
* Cisco AI for Networking
* Google Cloud Generative AI Leader
* *Currently preparing for Palo Alto Networks PCNSA/PCNSE*

### Project Highlights
* Built a BGP Fabric & IPAM/ASN Tracker — a Python/FastAPI tool syncing with the Juniper Mist API to track ASN allocations, BGP peering, subnet usage, and topology, with CSV export and snapshot history.
* Automated F5 BIG-IP certificate lifecycle management (ACME-based issuance via iControl REST and Ansible), replacing manual renewal processes.
* Delivered Ansible automation across the stack: Infoblox IPAM fixed-address reservations, Nagios XI hostgroup management via REST API, and Palo Alto Panorama address object/group management.
* Built a custom Grafana + Prometheus monitoring dashboard for F5 BIG-IP infrastructure.

I deliver tailored solutions that align technical architecture with critical business goals, and write about the networking and automation work I do here on this site.
