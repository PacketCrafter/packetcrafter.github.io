---
title: "Automating Infoblox IPAM with Ansible"
description: "How the infoblox.nios_modules collection turns DNS, DHCP, and IP address management into version-controlled, idempotent Ansible playbooks."
date: 2026-04-04
showHero: true
tags: ["Ansible", "Infoblox", "Automation", "DDI", "IPAM"]
showTableOfContents: true
draft: false
---

## Why DDI ends up getting automated first

DNS, DHCP, and IP address management — collectively "DDI" — tend to be the first core network services teams automate, for a simple reason: they're high-frequency, low-judgment changes. Allocating a subnet, reserving an IP for a new server, adding a host record — none of it requires real engineering judgment, but doing it by hand across a spreadsheet or a web UI, over and over, is exactly where IP conflicts, stale DNS records, and configuration drift creep in. Infoblox's own positioning on this is blunt: DDI managed by hand across disconnected tools and tickets is a drift generator, not a source of truth.

Infoblox NIOS — the Grid-based on-prem DDI platform most enterprises run today — exposes a WAPI (Web API) that Ansible talks to through the `infoblox.nios_modules` collection. That collection is what turns "log into the Grid Manager UI and click around" into a YAML file you can diff, review, and roll back.

## The collection and what it covers

```bash
pip install infoblox-client
ansible-galaxy collection install infoblox.nios_modules
```

The collection ships around 30 modules, an inventory plugin, and three lookup plugins. The modules break down into a few functional groups:

* **Network and IPAM objects** — `nios_network`, `nios_network_view`, `nios_range`, `nios_fixed_address`, `nios_vlan`.
* **DNS records** — `nios_a_record`, `nios_aaaa_record`, `nios_cname_record`, `nios_host_record`, `nios_ptr_record`, `nios_mx_record`, `nios_srv_record`, `nios_txt_record`, `nios_naptr_record`, `nios_zone`, `nios_dns_view`.
* **DNS Traffic Control (load balancing)** — `nios_dtc_server`, `nios_dtc_pool`, `nios_dtc_lbdn`, and per-protocol health monitors (`nios_dtc_monitor_http`, `_icmp`, `_tcp`, `_snmp`, `_sip`, `_pdp`).
* **Grid and admin** — `nios_member`, `nios_adminuser`, `nios_extensible_attribute`, `nios_restartservices`.

Alongside the modules, three lookup plugins solve the problem every IPAM automation playbook eventually runs into — picking a value that isn't fully known ahead of time:

* `nios_next_ip` — returns the next available IP address in a given network.
* `nios_next_network` — returns the next available network/subnet within a container.
* `nios_next_vlan_id` — returns the next available VLAN ID within a VLAN view or range.

An `nios_inventory` plugin can also populate Ansible's dynamic inventory straight from what's registered in the Grid, which is useful when the Grid itself is the source of truth for what hosts exist.

## A basic provisioning playbook

A typical pattern — create a network, carve a DHCP range out of it, and reserve a fixed address for a specific host — looks like this:

```yaml
- hosts: localhost
  connection: local
  gather_facts: false
  vars:
    nios_provider:
      host: "{{ infoblox_grid_host }}"
      username: "{{ infoblox_username }}"
      password: "{{ infoblox_password }}"

  tasks:
    - name: Create the network
      infoblox.nios_modules.nios_network:
        network: 10.20.30.0/24
        comment: "App tier - provisioned via Ansible"
        state: present
        provider: "{{ nios_provider }}"

    - name: Carve out a DHCP range for dynamic clients
      infoblox.nios_modules.nios_range:
        network: 10.20.30.0/24
        start_addr: 10.20.30.50
        end_addr: 10.20.30.200
        state: present
        provider: "{{ nios_provider }}"

    - name: Reserve a fixed address for a known host
      infoblox.nios_modules.nios_fixed_address:
        name: app-server-01
        ipv4addr: 10.20.30.10
        mac: "00:50:56:aa:bb:cc"
        comment: "Reserved via Ansible playbook"
        state: present
        provider: "{{ nios_provider }}"

    - name: Create the matching host record (A + PTR)
      infoblox.nios_modules.nios_host_record:
        name: app-server-01.corp.example.com
        ipv4addrs:
          - ipv4addr: 10.20.30.10
        state: present
        provider: "{{ nios_provider }}"
```

Every module here is idempotent: rerun the playbook and it only changes what's actually different from the Grid's current state, rather than failing on "already exists" or silently duplicating an object. That property is what makes it safe to run this from a CI pipeline on every merge, not just by hand.

## Letting Infoblox pick the address for you

Static assignment is fine for a handful of hosts, but it doesn't scale to "give me the next free IP in this subnet." That's what the `nios_next_ip` lookup is for — it asks the Grid directly instead of tracking free addresses yourself:

```yaml
- name: Get the next available IP in the subnet
  set_fact:
    next_ip: "{{ lookup('infoblox.nios_modules.nios_next_ip', '10.20.30.0/24', provider=nios_provider) }}"

- name: Create a fixed address at that IP
  infoblox.nios_modules.nios_fixed_address:
    name: "{{ inventory_hostname }}"
    ipv4addr: "{{ next_ip }}"
    mac: "{{ ansible_facts.default_ipv4.macaddress }}"
    state: present
    provider: "{{ nios_provider }}"
```

That one change — asking the Grid instead of maintaining a spreadsheet of what's taken — is usually the point where IPAM automation stops being a convenience and starts being the actual source of truth.

## Configuration-as-Code, not just scripted clicks

The pattern that's emerged across Infoblox and Red Hat's own joint guidance isn't "replace clicking with a script" — it's full Configuration-as-Code: the desired DDI state lives in Git as YAML, and a platform like Ansible Automation Platform (AAP) applies it. A typical structure splits the work into a few roles:

* An **infrastructure setup** role that creates IP spaces, DNS views, subnets, and zones — the containers everything else lives in.
* A **workload provisioning** role that allocates IPs, creates host/A/PTR records, and sets up fixed DHCP reservations for individual hosts.
* **Verification** roles that query the Infoblox API after a change to confirm the Grid actually matches what the YAML says it should.

Wired into a CI pipeline, the workflow looks like: edit a YAML file describing a zone or subnet → commit and push → a webhook triggers the matching AAP workflow template → the provisioning job applies the change → a verification job confirms it landed → done. If any step fails, the workflow stops rather than leaving things half-applied.

The payoff is less about typing speed and more about what you get once DDI state is in Git: every change has an author and a commit message, a bad change can be reverted the same way a bad code change can, and the same YAML can be applied consistently to a dev Grid and a production Grid instead of trusting that someone clicked the same sequence of buttons in both.

## NIOS today, Universal DDI tomorrow

Everything above targets NIOS — Infoblox's on-prem/Grid-based platform, which is still what most existing deployments run and what `infoblox.nios_modules` is built for. Infoblox's newer product line, Universal DDI, moves DDI management into a cloud-hosted portal with its own REST API, and has its own collection — `infoblox.universal_ddi` — with an equivalent set of resources (DNS views, IP spaces, subnets) expressed as Ansible modules against the portal API instead of a Grid Manager. If you're planning a longer-term DDI roadmap, it's worth knowing the two collections exist side by side rather than assuming NIOS automation carries over unchanged — the object model is similar in spirit, but the modules and authentication are different.

## Where this pays off

The honest case for automating DDI isn't that clicking through Grid Manager is hard — it's that it doesn't scale and doesn't leave a trail. A hundred manual IP reservations are a hundred chances for a typo, a forgotten PTR record, or two people claiming the same address an hour apart. A hundred applications of the same reviewed, version-controlled playbook are the same change, verified, every time.
