# TechNetGame V14 — Editorial Hardening

Foco desta versão:
- endurecimento do gerador de títulos
- bloqueio de headlines ruins ou híbridas (EN/PT)
- fallback seguro por marca/tema
- penalidade forte para títulos ruins no qualityScore
- weakContent mais rígido
- preservação da estrutura de deploy, incluindo pasta oracle-key com instruções

Principais mudanças em backend/src/services/editorialService.js:
- remoção das caudas artificiais genéricas
- validação `isInvalidHeadline()`
- fallback `buildSafeHeadlineByBrand()`
- finalização segura com `finalizeHeadline()`
- score mais duro para títulos problemáticos
