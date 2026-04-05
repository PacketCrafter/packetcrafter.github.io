---
title: "Automating Infoblox IPAM with Ansible"
description: "Streamlining DHCP scopes and IPv4 reservations using the NIOS modules."
title: "The AI Revolution: Juniper Mist vs. Traditional Networking"
date: 2026-04-04
thumbnail: "feature.png"
showHero: true
date: 2026-03-12
tags: ["Ansible", "Infoblox", "Automation", "Python", "IPAM"]
categories: ["Network Automation"]
featureImage: "images/ansible-infoblox-header.png"
cardView: true
showFeatureImage: true
showTableOfContents: false
draft: false
---

## Infrastructure Overview

To manage a modern enterprise network, the source of truth (IPAM) must be integrated into the CI/CD pipeline. This workflow leverages Ansible AutomationPlatform (AAP) to drive Infoblox NIOS configurations.


1. Dynamic Network & DHCP Range Creation
I was tasked with the rapid provisioning of multiple IPv4 networks and DHCP lease ranges for a complex brownfield migration project. To ensure zero-touch consistency and eliminate manual entry errors during the migration window, I developed an automated solution using Ansible and the Infoblox NIOS collection.Logic & Transformation: The playbook accepts a network subnet (e.g., 10.0.0.0/24) and uses the ansible.netcommon.ipaddr filter to programmatically identify network and broadcast boundaries.Automated Pool Slicing: To standardize the environment, I utilized regex_replace to automatically carve out a DHCP pool starting at the .5 host address and ending at .250, ensuring reserved space for gateway redundancy and static infrastructure.Data Integrity: Before any changes reach the Infoblox Grid, the workflow utilizes assert tasks to validate that the input variables are iterable and that the failover_association is correctly set to either failover1 or failover2.Standardized Options: Each new network is automatically provisioned with enterprise-standard DNS members, domain names, and default gateway options.



2. IPv4 Fixed Address Management
To handle static reservations at scale, I implemented a data-driven approach using AAP Surveys.


Parsing: The playbook utilizes the from_yaml filter to convert raw survey text into a structured list of IP and MAC mappings.


Auditability: Every reservation includes a custom comment—Created via AAP Survey—ensuring every object in the Infoblox Grid is traceable back to the automation task.

3. Core Automation Logic (YAML)
Here is the snippet demonstrating the dynamic range calculation:

YAML
# Snippet: Programmatic Range Boundaries
vars:
  net_addr: "{{ item.network | ansible.netcommon.ipaddr('network') }}"
  bc_addr: "{{ item.network | ansible.netcommon.ipaddr('broadcast') }}"
  range_start: "{{ net_addr | regex_replace('\\.[0-9]+$', '.5') }}"
  range_end: "{{ bc_addr | regex_replace('\\.[0-9]+$', '.250') }}"

---
