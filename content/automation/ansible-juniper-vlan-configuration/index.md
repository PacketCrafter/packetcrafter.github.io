---
title: "Automating Juniper Junos with Ansible and NETCONF"
date: 2026-01-11
description: "A technical deep-dive into idempotent network configuration management using the junipernetworks.junos collection."
tags: ["Ansible", "Juniper", "Junos", "IaC", "NETCONF"]
categories: ["Network Automation"]
series: ["Infrastructure as Code"]
showTableOfContents: true
draft: false
---

## Overview
[cite_start]Network automation is no longer just a luxury—it's a requirement for modern infrastructure[cite: 5]. [cite_start]This project demonstrates a transition from traditional "screen-scraping" to an API-first mindset[cite: 7]. [cite_start]By using **Ansible** and **NETCONF** (XML over SSH), configuration changes become faster, safer, and completely idempotent[cite: 7, 8].

## The Workflow
The automation pipeline follows a structured three-step process to ensure network stability:

1.  [cite_start]**Ansible Control Node:** A Linux environment where Ansible and the `junipernetworks.junos` collection manage the logic[cite: 10].
2.  [cite_start]**NETCONF Protocol:** The transport mechanism used to push configuration securely[cite: 11].
3.  [cite_start]**Candidate Configuration:** Ansible pushes a "Candidate" config, performs a commit check, and then commits the changes to the active state[cite: 12].



## Project Structure
[cite_start]A clean automation project keeps variables and logic separated for scalability[cite: 13, 14]:

| File | Purpose |
| :--- | :--- |
| `ansible.cfg` | [cite_start]Connection settings [cite: 15] |
| `inventory.yml` | [cite_start]List of switches and connection variables [cite: 15] |
| `pb_config_vlans.yml` | [cite_start]The Playbook containing the automation logic [cite: 15] |
| `configs/vlan_data.conf` | [cite_start]Directory for Junos snippets (the specific changes) [cite: 15] |

---

## Technical Implementation

### 1. Inventory Management
[cite_start]We define the target hosts and the required variables to establish a NETCONF session[cite: 16, 17].

```yaml
# inventory.yml
all:
  hosts:
    access-switch-01:Automating Juniper Networks with Ansible

Network automation is no longer just a luxury—it’s a requirement for modern infrastructure. In this post, I’ll walk through how I use Ansible to manage Juniper Junos devices.

Unlike traditional "screen-scraping" methods, Juniper switches are built with an API-first mindset, allowing Ansible to communicate via NETCONF (XML over SSH). This makes changes faster, safer, and completely idempotent.

The Workflow

Ansible Control Node: A Linux machine where Ansible and the junipernetworks.junos collection are installed.

NETCONF: The protocol used to push configuration.

Candidate Configuration: Ansible pushes a "Candidate" config, performs a commit check, and then commits the changes.

Project Structure

A clean automation project keeps variables and configurations separated:

.
├── ansible.cfg          # Connection settings
├── inventory.yml        # List of switches
├── pb_config_vlans.yml  # The Playbook
└── configs/             # Directory for Junos snippets
    └── vlan_data.conf   # The specific change to apply


1. The Inventory (inventory.yml)

We define our switches and the required variables to connect via NETCONF.

all:
  hosts:
    access-switch-01:
      ansible_host: 10.0.1.50
  vars:
    ansible_connection: ansible.netcommon.netconf
    ansible_network_os: junipernetworks.junos.junos
    ansible_user: automation_user
    # Recommended: Use SSH keys or Ansible Vault for passwords


2. The Configuration Snippet (configs/vlan_data.conf)

This is standard Junos text format. Ansible will "merge" this into the existing configuration.

vlans {
    Guest_WiFi {
        vlan-id 100;
        description "Guest Wireless Network";
    }
    Corporate_Data {
        vlan-id 200;
        description "Internal Employees";
    }
}


3. The Playbook (pb_config_vlans.yml)

This is the logic. It loads the file, compares it to the running config, and commits if there’s a difference.

---
- name: Configure VLANs on Juniper Switches
  hosts: all
  gather_facts: no

  tasks:
    - name: Load and Commit VLAN Configuration
      junipernetworks.junos.junos_config:
        src: "configs/vlan_data.conf"
        update: merge
        comment: "VLAN update via Ansible"
      register: config_output

    - name: Show the Diff (What changed?)
      debug:
        var: config_output.diff.prepared


The Result: Before vs. After

Before running the Playbook

The switch has no record of these VLANs:

user@access-switch-01> show configuration vlans 
# (Empty or default output)


Execution

When I run ansible-playbook -i inventory.yml pb_config_vlans.yml, Ansible performs a "diff."

After running the Playbook

The switch now has the new hierarchy, and we have an audit log of the change:

user@access-switch-01> show configuration vlans 
Guest_WiFi {
    vlan-id 100;
    description "Guest Wireless Network";
}
Corporate_Data {
    vlan-id 200;
    description "Internal Employees";
}

user@access-switch-01> show system commit 
0   2024-05-20 14:30:05 UTC by automation_user via netconf
    VLAN update via Ansible


Why this matters

By using this "Infrastructure as Code" approach, I can:

Version Control: Keep my network configs in GitHub.

Consistency: Deploy the same VLANs across 50 switches in the same amount of time it takes to do one.

Safety: Use check_mode to see what would happen before actually touching the production network.
      ansible_host: 10.0.1.50 [cite: 20, 21]
  vars:
    ansible_connection: ansible.netcommon.netconf [cite: 22, 23]
    ansible_network_os: junipernetworks.junos.junos [cite: 24]
    ansible_user: automation_user [cite: 25]
