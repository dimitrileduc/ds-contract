# Proof — save/restore scripts validation (024)

**Date**: 2026-08-23
**Operator**: implementing agent (NOT the owner)

## Scope of what an agent can prove

The owner instance `piqueray-odoo-test` (port 8071) is **off-limits to agents**
(project memory `project-odoo-docker-instances`). So this validation never touches
the owner. It exercises the two scripts entirely on **agent territory**:

- `save-seed.sh` was run in **read-only** mode against the QA instance
  (`piqueray-odoo-qa`, 8069) — `pg_dump` + `tar` only, no writes.
- `restore-seed.sh` was run against a **throwaway** instance
  (`piqueray-odoo-seedtest`, ports 8075/8078), created and destroyed for this test.

The **real seed** (the owner's montaged homepage) can only be produced by the owner
running `npm run odoo:save` against 8071 after the manual montage (US1). This proof
covers the **script mechanics and the round-trip fidelity**, not the montage content.

## T-guard — FR-009 owner protection

```
$ bash scripts/odoo/restore-seed.sh --project piqueray-odoo-test
restore-seed: REFUSING to restore into the owner instance 'piqueray-odoo-test'.
              Restore is destructive. If you really mean it, pass --owner.
exit code: 1
```
✓ Restore refuses the owner instance unless `--owner` is explicit. Nothing was touched.

## Save (read-only from QA)

```
seed>   database       : piqueray_qa (user odoo)
seed>   db.dump          : 2.55 MB
seed>   filestore.tar.gz : 3.98 MB
seed>   total            : 6.53 MB
```
✓ Both artifacts non-empty. Total **6.53 MB** — well under the 50 MB target (SC-003).
✓ Filestore archive is self-describing: top-level dir `piqueray_qa/` (restore derives
the DB name from it — no metadata file needed).

## Restore into throwaway + round-trip fidelity

`restore-seed.sh --project piqueray-odoo-seedtest` completed in **~10 s** (SC-003: < 2 min).

Row-count parity, source QA vs. restored throwaway (same DB dumped then restored):

| Table          | QA source | Restored | Match |
|----------------|-----------|----------|-------|
| ir_ui_view     | 1384      | 1384     | ✓ |
| ir_attachment  | 292       | 292      | ✓ |
| website_page   | 32        | 32       | ✓ |
| website_menu   | 11        | 11       | ✓ |
| res_users      | 5         | 5        | ✓ |
| filestore files| 49        | 49       | ✓ |

✓ The round-trip reproduces the source DB + filestore **exactly** (SC-002 mechanism proven).

## US3 — owner/QA isolation

Owner (8071) and QA (8069) were **HTTP 200 both before and after** the throwaway was
created, restored into, and destroyed (`down -v`). Only owner + QA containers remained.
✓ SC-004 mechanism proven — an agent's disposable instance never affects the owner.

## Named finding — a latent, out-of-scope footer defect in the QA test content

A fresh boot of the restored throwaway returned **HTTP 500** on `/`, while the source QA
(a long-running process) returned 200 from the **same DB content**. Diagnosis:

- Error: `KeyError: 'x_pqr_footer_col1'`, template `piqueray_ds.footer_bar`.
- The four `x_pqr_footer_*` fields are **not declared in the addon source**
  (`grep -rn x_pqr_footer integrations/odoo/addons/` → empty), yet exist in the DB as
  `ir_model_fields` rows with **`state='base'`** owned by module `piqueray_ds`.
- A `base`-state field with no backing Python is dropped from the registry on a fresh
  boot → the QWeb `t-field` reference raises `KeyError`. The source QA only renders
  because its **in-memory registry predates** the field-state change.
- Flipping the four fields to `state='manual'` and restarting the throwaway → **HTTP 200**.

**This is not a seed-script defect** — the scripts reproduced the source faithfully,
footer breakage included. It is a defect in the **QA test content**, and the footer is
**explicitly out of scope for this spec** (FR-010; footer is owned by another spec).
The scripts deliberately do **not** doctor content (honesty/determinism): a seed must
reproduce its source, not silently repair it. Surfaced here so the footer spec — and the
owner, before producing the real seed from 8071 — can fix the field declaration upstream.
