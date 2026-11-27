---
title: "Modern Fabric Evolution: From VLANs to EVPN-VXLAN"
date: 2025-01-19
showHero: true
draft: false
description: "A deep dive into why EVPN-VXLAN is the standard for modern Data Center and Campus networks."
tags: ["Networking", "EVPN", "VXLAN", "BGP", "Automation"]
showTableOfContents: true
---

## The scalability wall

Traditional networks built on VLANs were designed for small, single-building footprints. Modern environments — data centers, high-density campuses, cloud — require a different logic: scale to thousands of networks, maintain mobility as workloads move, and stay compatible with automation workflows.

At scale, the cracks show fast. STP becomes a liability, blocking redundant paths and turning every topology change into a network-wide convergence event. ARP floods every segment each time a host moves or ages out, and in a 10,000-endpoint data center that noise never stops. Add manual VLAN pruning across hundreds of trunk ports, and you have an architecture that fights you every time the business needs to grow.

### The solution: VXLAN

**VXLAN (Virtual Extensible LAN)** is a tunneling mechanism that carries Ethernet (Layer 2) over IP (Layer 3).

* **VLANs:** limited to 4096 IDs; struggle with spanning routed boundaries.
* **VXLAN:** scales to **16 million segments** (VNIs) and wraps Ethernet frames inside UDP/IP packets.

> **Analogy:** if a VLAN is a local street, the IP network is the highway system. VXLAN is the transport truck that carries your car (the L2 frame) across the highway (the L3 fabric) without the car needing to know the route.

### VXLAN overview

The device responsible for this wrapping and unwrapping is called a VTEP (VXLAN Tunnel Endpoint) — typically a physical switch or a virtual switch on a hypervisor. When a frame leaves a host, the local VTEP encapsulates it: the original Ethernet frame gets a 24-bit VNI header stamped on it, then the whole thing is wrapped in a UDP packet (destination port 4789) and shipped across the IP underlay as ordinary routed traffic. On the far end, the remote VTEP strips the outer headers and delivers the original frame to its destination — the hosts on either side have no idea a tunnel exists. One practical note: make sure UDP 4789 is permitted on any ACLs or firewalls sitting in the underlay path, or your overlay traffic silently disappears.

{{< figure src="VLAN_VXLAN.png" title="VLAN-VXLAN Overview" caption="The VXLAN encapsulation process" alt="VXLAN Diagram" class="mx-auto" >}}

## Why VXLAN needs EVPN

VXLAN defines the data plane — how the packet is wrapped — but it doesn't solve the control-plane problem on its own. Early VXLAN relied on flood-and-learn (multicast), which is inefficient and difficult to automate. In a 500-node data center, every ARP request, every unknown MAC, every DHCP discover becomes a storm that every tunnel endpoint has to process. It doesn't scale, and it's nearly impossible to automate around.

EVPN fixes this by using Multiprotocol BGP as the control plane. When a host comes online, its local VTEP generates a Route Type 2 (MAC/IP Advertisement) and distributes it to every peer via BGP. Every VTEP now has a local copy of the MAC-to-VTEP mapping — before a single data packet is sent.

That prefix distribution also enables ARP suppression: when a host ARPs for a neighbor, the local VTEP checks its BGP-learned table and replies directly, proxy-style. The ARP never hits the wire. At scale, this is the difference between a fabric that hums and one that spends half its capacity on control-plane noise.

**EVPN (Ethernet VPN)** uses Multiprotocol BGP to:

1. **Advertise MAC/IP addresses** — no more "shouting" via broadcast.
2. **Minimize flooding** — switches know exactly where endpoints live before traffic even starts moving.
3. **Support automation** — BGP-based control planes are highly predictable and programmable.

### Architecture overview

In a leaf-spine fabric, the two tiers have distinct, deliberate roles. The spine layer is pure IP — it forwards packets across the underlay and has no VTEP function whatsoever. Spines don't participate in VXLAN encapsulation; they just route UDP/IP traffic fast. The leaf layer is where the intelligence lives: every leaf is a VTEP, terminating tunnels, encapsulating host traffic, and running BGP EVPN to advertise MAC/IP bindings to its peers.

This separation produces two parallel planes running on the same physical wires. The underlay is a simple, stable IP fabric — typically OSPF or IS-IS for reachability between loopbacks. The overlay is the VXLAN fabric riding on top of it, invisible to the underlay routers.

For BGP peering, there are two common models: iBGP with route reflectors (spines act as RRs, leaves are clients — simpler ASN design), or eBGP (each leaf gets a unique ASN, spines are transit — more failure isolation, favored in large-scale and cloud deployments). Either works; the choice usually comes down to operational preference and scale requirements.

{{< figure src="EVPN-VXLAN_setup.png" title="EVPN-VXLAN Leaf-Spine Architecture" caption="Note the BGP control plane peering between VTEPs" alt="Network Diagram" class="mx-auto" >}}

## Conclusion

EVPN-VXLAN isn't just a tunneling trick — it's the foundation modern infrastructure is built on. Multi-tenant data centers, seamless workload mobility across racks and sites, and fabrics that respond to API calls instead of CLI sessions: none of that is possible when your control plane is flooding and your segmentation tops out at 4096. When the network speaks BGP and every MAC/IP binding is a route, automation stops being a workaround and starts being the default operating model.
