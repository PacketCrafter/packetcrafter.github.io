---
title: "Automating Infoblox IPAM with Ansible"
description: "Streamlining DHCP scopes and IPv4 reservations using the NIOS modules."
date: 2026-03-07
tags: ["Ansible", "Infoblox", "Automation", "Python", "IPAM"]
categories: ["Network Automation"]
series: ["Infrastructure as Code"]
showTableOfContents: true
draft: false
---

## Infrastructure Overview

To manage a modern enterprise network, the source of truth (IPAM) must be integrated into the CI/CD pipeline. This workflow leverages Ansible Automation Platform (AAP) to drive Infoblox NIOS configurations.

```mermaid
graph TD
    A[AAP Survey / YAML Input] --> B{Ansible Controller}
    B --> C[Validate & Parse YAML]
    C --> D[Calculate DHCP Range]
    D --> E[NIOS API Call]
    E --> F[(Infoblox Grid)]


1. Dynamic Network & DHCP Range Creation
One of the primary challenges was automating the calculation of DHCP boundaries. I developed a playbook that identifies the network and broadcast addresses from a subnet input and programmatically carves out a standard pool.


Logic: The script uses ansible.netcommon.ipaddr to identify the network base and then uses regex to define a DHCP range starting at .5 and ending at .250.


Validation: To prevent configuration errors, an assert task verifies that the failover_association is correctly set to either failover1 or failover2 before execution.

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
