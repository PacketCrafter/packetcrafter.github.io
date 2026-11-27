---
title: "Agentic NetOps, Grounded: What Vendors Actually Mean When They Say 'AI Agent'"
date: 2026-11-27
thumbnail: "feature.png"
showHero: true
draft: false
description: "Cisco and HPE/Juniper are both pitching agentic AI for network operations, but they disagree on how much autonomy belongs in the loop. A look at the actual capability claims behind the marketing."
tags: ["AI Networking", "AIOps", "Agentic AI", "NetDevOps", "Networking"]
---

## The pitch, and why it's showing up everywhere

"Agentic AI" has become the default vocabulary for AIOps vendors this year, and network operations is one of the categories where the pitch is easiest to understand: too many alerts, not enough engineers, and telemetry spread across domains (wired, wireless, WAN, security) that no human correlates fast enough. Cisco's Joe Vaccaro, SVP and GM of Cisco Network Platform and ThousandEyes, put the driver bluntly in a recent Targeting AI podcast appearance: "you can't hire enough people" to resolve the alert volume manually.

The interesting part isn't that vendors are pointing AI at this problem — they have been for years, under the AIOps label. It's how differently they're drawing the line on autonomy.

## Cisco: sense, diagnose, plan, act — with a deterministic last step

Cisco frames its agentic approach around four stages: sense an issue, diagnose it using cross-domain telemetry, plan a remediation, and act. The detail worth noting is where Cisco keeps humans and determinism in the loop. Rather than letting an AI agent improvise a fix, Cisco builds the "act" stage on predefined workflows — Vaccaro describes it as wanting "a level of deterministic execution." In other words: AI can sense and reason across domains, but what it's allowed to actually change is bounded by playbooks a human already approved, not open-ended judgment calls at 2 a.m.

Cisco's own framing acknowledges the unsolved part of this too: getting enterprises comfortable letting agents make network changes without a human in the approval path is described as an ongoing challenge, not a solved one. That's a more conservative posture than some of the "self-driving network" messaging circulating elsewhere in the category, and it's a useful lens for evaluating any vendor's claims — ask specifically which stage (sense, diagnose, plan, act) the AI operates in, and which ones still require a human click.

## HPE/Juniper: broader autonomy claims, less public detail on guardrails

HPE's Juniper Networking portfolio has been pushing further on autonomy in its own materials, built around Mist AI's Marvis assistant and a newer "Marvis Actions" capability. The vendor's language describes Marvis Actions autonomously addressing a broader set of network issues — misconfigured ports, capacity constraints, hardware compliance — while "retaining full IT oversight." Juniper has also been layering in Apstra integration for data center use cases, described as supporting autonomous provisioning and service validation, and simulation features ("Marvis Minis") meant to project user experience issues before they're reported.

The capability claims are broader than Cisco's public framing, but the available detail on specific guardrails — what triggers a rollback, what's logged, what requires explicit approval versus running automatically — is thinner in public materials. That's not necessarily a red flag; it's a reason to ask the question directly in a bake-off rather than take "full IT oversight" at face value.

## What this means if you're evaluating these tools

A few questions worth asking any vendor pitching agentic NetOps capability, based on where the real disagreement in the industry currently sits:

In practice, the most useful framing isn't "does this vendor have agentic AI" — at this point, everyone will answer yes. It's "which stage does the autonomy apply to, and what's the blast radius if it's wrong." An AI that correlates telemetry across your wireless, WAN, and security domains to hand you a root cause in minutes is valuable with essentially no downside risk. An AI that executes a remediation workflow against production devices without a human in the loop needs a very clear answer to "what happens when it's wrong," and that answer should come with specifics, not reassurance.

If you're piloting any of these platforms, start by scoping them to the sense/diagnose stages — cross-domain correlation and root-cause narrowing are where the current generation of tools demonstrably saves engineer time, with the least exposure if the model gets something wrong. Treat autonomous remediation claims as the thing to pressure-test hardest in a POC, not the headline to take at face value.

Sources: [The rise of agentic AI in networking — TechTarget](https://www.techtarget.com/news/the-rise-of-agentic-ai-in-networking/873579/) · [HPE unveils agentic AI upgrades to Juniper for self-driving IT](https://itbrief.com.au/story/hpe-unveils-agentic-ai-upgrades-to-juniper-for-self-driving-it)
