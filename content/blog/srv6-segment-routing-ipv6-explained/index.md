---
title: "SRv6 Explained: What Segment Routing Over IPv6 Actually Changes"
date: 2026-11-27
showHero: true
draft: false
description: "SRv6 replaces MPLS label stacks with IPv6 addresses that double as instructions. Here's how segment routing over IPv6 actually works, why operators are migrating to it, and where it still gets complicated."
tags: ["SRv6", "Segment Routing", "IPv6", "BGP", "Networking", "Protocol Deep Dive"]
#series: ["Network Architecture"]
showTableOfContents: true
---

## The problem SRv6 is solving

Traditional MPLS traffic engineering works, but it works by bolting a separate control plane and label-switching data plane onto IP. You need LDP or RSVP-TE to distribute labels, a separate forwarding paradigm from your IP routing, and — if you want fine-grained traffic engineering — a stack of TE extensions that get genuinely hard to operate at scale. Segment Routing (SR) emerged to simplify this: instead of distributing labels hop by hop, you encode a path as a list of instructions ("segments") at the ingress node, and every subsequent router just forwards based on that list.

SRv6 is segment routing's IPv6-native evolution. Instead of MPLS labels, segments are IPv6 addresses. That single design choice ripples through the rest of the architecture in ways worth understanding before you consider a migration.

## How it actually works

In SRv6, each "segment" is a 128-bit IPv6 address that represents either a node, a link, or a specific function to perform (e.g., "forward to this VPN," "apply this policy," "decapsulate and deliver locally"). These addresses are called SIDs — Segment Identifiers.

A path through the network is expressed as an ordered list of these SIDs, carried in a Segment Routing Header (SRH) — an IPv6 extension header appended to the packet. The ingress node computes the SID list (via a controller, BGP-LS/PCEP, or local policy) and pushes it onto the packet. Each transit node simply looks at the IPv6 destination address — which is the *current* active segment — processes any associated instruction, and if there are more segments remaining, decrements a pointer and forwards to the next one.

The elegant part: a router that doesn't understand SRv6 at all can often still forward the packet correctly, because it's just routing on a normal-looking IPv6 destination address. That incremental-deployment property is a meaningful operational advantage over MPLS, where every node in the path traditionally needs label-switching capability.

### SIDs as functions, not just locations

This is where SRv6 diverges most from "segment routing is just MPLS with bigger labels." A SID isn't only "go to this node" — it can encode a *function* to execute at that node: decapsulate and forward into a specific VRF, apply a specific QoS policy, perform a service chain hop into a firewall or load balancer, and so on. This is formalized as the SRv6 Network Programming model (RFC 8986), where the network effectively becomes programmable at the packet-forwarding layer: a SID list is a tiny program, and each router executes the instruction addressed to it.

### Micro-SIDs: solving the header-overhead problem

The honest criticism of early SRv6 was header overhead — a full 128-bit SID per segment, multiplied across a long SID list, adds up fast in a packet that also needs room for payload. The industry answer has been **SRv6 uSID (micro-SID)**, which compresses multiple segment instructions into a single 128-bit address by packing several 16- or 32-bit micro-segment identifiers into one IPv6 address, dramatically shrinking the SRH for common topologies. If you're evaluating SRv6 for WAN-scale deployment, uSID support (and your vendor's specific compression scheme) is one of the first things to check — it materially changes the MTU and performance math.

## Why operators are migrating

- **One data plane for everything.** SRv6 natively carries L3VPN, EVPN (L2VPN), and traffic engineering on the same IPv6 forwarding plane, rather than requiring separate MPLS and IP forwarding stacks.
- **Simplified control plane.** Drop LDP and RSVP-TE. BGP (with SRv6-specific extensions) can carry what you need for VPN services and, combined with a controller speaking BGP-LS, for traffic engineering too.
- **Native multi-domain and cross-provider reach.** Because segments are just IPv6 addresses, SRv6 paths can, in principle, extend across autonomous system boundaries more naturally than MPLS label spaces, which are typically confined to a single provider's domain.
- **Built-in service programmability.** The Network Programming model means service chaining and VPN termination instructions travel with the packet instead of requiring separate signaling.

## Where it still gets complicated

- **Header overhead is real, even with uSID.** Long SID lists still cost bytes, and MTU planning across a network with variable encapsulation needs real attention, not an afterthought.
- **Hardware support varies.** Line-rate SRv6 forwarding, and specifically uSID, requires merchant silicon or ASICs with the lookup and header-manipulation capability to handle it efficiently. Older platforms may support SRv6 only in software, with real performance implications.
- **Operational tooling maturity lags MPLS.** Decades of MPLS troubleshooting muscle memory — traceroute semantics, OAM tooling, vendor CLI familiarity — doesn't transfer cleanly. Plan for a real learning curve on day-2 operations, not just day-1 design.
- **IPv6-only is not actually required, but mixed environments add complexity.** You can run SRv6 over a dual-stack network, but your migration plan needs to be explicit about which services ride which plane during the transition, and for how long.

## Should you migrate?

If you're running a greenfield data center fabric or a service-provider WAN core already committed to IPv6, and you're tired of operating two parallel control planes for the same intent, SRv6 is a legitimate simplification, not just vendor-driven churn. If you're on a stable MPLS core with no IPv6-readiness story yet, the header overhead and tooling-maturity concerns above are reason enough to treat this as a multi-year roadmap item rather than a quarter's project. Either way, understanding the SID-as-program mental model is worth doing now — it's the direction the IETF segment-routing work (srv6ops) has been heading for several years, and vendor roadmaps are following it.
