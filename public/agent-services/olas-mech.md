# Olas Mech Marketplace readiness descriptor

Goal: expose bounded research and operations services as machine-buyable agent tools.

Canonical service definitions:
https://raw.githubusercontent.com/OGKaMp3R/calyx/main/public/agent-services/catalog.json

Best initial Mech candidates:
1. competitor-pricing-snapshot-3
   Input: business context + up to 3 competitors
   Output: source-linked pricing/package comparison + 3 review actions
2. subscription-quick-scan-10
   Input: up to 10 software/AI/subscription line items
   Output: normalized list + public price checks + overlap/renewal flags + 3 actions
3. ai-workflow-cleanup-3
   Input: descriptions of up to 3 workflows
   Output: current-state map + bottlenecks + automation/approval points + future-state design

Current state:
- Service definitions are public.
- No Olas wallet, agent registration, Mech deployment, or crypto settlement has been configured.
- Those financial/account setup steps require the owner.
