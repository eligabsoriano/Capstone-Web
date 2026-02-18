# Category 4: Threat Modeling

Evidence Source: `readmes/Information Assurance Security 2 Manuscript.txt`

## Criteria

| Criteria | Checkpoint | Rating |
|---|---|---|
| DFD | Is a data flow diagram created? | ☐ None  ☐ Basic  ☐ Detailed  ☑ Trust boundaries |
| STRIDE | Are threats identified? | ☐ None  ☐ Few  ☐ All STRIDE  ☑ Detailed |
| OWASP | Is OWASP mapped? | ☐ None  ☐ Basic  ☑ Top 10  ☐ + CVSS |
| Mitigation | Is there a mitigation plan? | ☐ None  ☐ Basic  ☑ Prioritized  ☑ Owners + timeline |
| Risk Assessment | Are risks scored? | ☐ None  ☐ Basic  ☐ Qualitative  ☑ Quantitative |
| Updates | Is model updated? | ☐ Static  ☐ Once  ☐ Regular  ☑ Automated |
| Documentation | Is it well documented? | ☐ Poor  ☐ Basic  ☐ Clear  ☑ Visual |

## What Has Been Implemented

1. Trust boundaries are explicitly defined across client-server, gateway-service, and service-data layers.
2. STRIDE analysis is detailed, with system component, likelihood, impact, risk score, and mitigation.
3. OWASP Top 10 mapping is present, including a STRIDE-to-OWASP mapping table tied to related assets and affected components.
4. Threat prioritization is included using impact-vs-likelihood scoring and explicit risk-group ranking.
5. A dedicated `4.3 Threat Prioritization` section ranks threats using impact vs likelihood and explicitly lists highest, medium, and low-risk groups.
6. Risk assessment is performed qualitatively using likelihood-impact-risk classification.
7. The manuscript notes ongoing threat-model updates as part of continuous security assessment.

## How to Test Category 4

1. DFD/Trust Boundaries: verify architecture sections define system components, data paths, and trust boundaries.
2. STRIDE Coverage: confirm all 6 STRIDE categories are represented with concrete threat entries.
3. OWASP Mapping: check that threats are mapped to OWASP Top 10 categories (not just mentioned generally).
4. Mitigation Plan Quality: verify each critical threat has mitigation, and action items are prioritized by urgency/sprint.
5. Risk Scoring and Prioritization: verify each threat has likelihood + impact + resulting risk level, and that `4.3` clearly groups highest, medium, and low-risk threats.
6. Update Process: verify documentation states periodic model updates and aligns with security assessment cycle.
7. Documentation Quality: review readability, structure, and whether tables are usable by faculty evaluators.

## Overall Readiness

- Readiness: **Mostly Ready (Good)**
- Estimated Category 4 level: **Good (4/5)**
- Main gaps before “Excellent”:
1. Add explicit quantitative scoring (e.g., CVSS) for higher-risk threats.
2. Assign named owners per mitigation action and include target completion dates.
3. Add a formal update cadence artifact (e.g., quarterly threat-model review log).
4. Ensure the DFD visual is clearly included/exported in the submitted manuscript version.
