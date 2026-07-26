#!/usr/bin/env bash
# figma-visual-proof.sh — garde-fou "before-capture" pour les mutations
# figma-console MCP (CLAUDE.md, règle owner 2026-07-24 ; instrument réel :
# extract/figma/page-parity/, PAS le skill générique /image-diff).
#
# PreToolUse  : bloque une mutation canvas si aucune capture récente
#               (<5 min) n'existe sous .page-parity/. C'est un proxy
#               heuristique (un fichier récent), PAS une preuve — la preuve
#               reste `npm run pages:compare`.
# PostToolUse : rappel non-bloquant après toute mutation. figma_execute est
#               TOUJOURS rappelé (jamais bloqué) : ce hook ne peut pas
#               distinguer un script de lecture (scan/capture) d'une
#               mutation réelle depuis le seul nom de l'outil — limite
#               nommée, pas cachée (Principe V, honnêteté).
#
# Dégradation propre (jamais de blocage sans alternative) : pas de jq,
# instrument absent de ce repo/worktree, appel non concerné -> exit 0.
#
# Déclaré dans .claude/settings.json (projet, versionné) ->
# hooks.PreToolUse / hooks.PostToolUse (matcher "mcp__figma-console__.*").

JQ=/usr/bin/jq
[ -x "$JQ" ] || JQ="$(command -v jq 2>/dev/null)"

input="$(cat)"
[ -n "$JQ" ] || exit 0

event="$(printf '%s' "$input" | "$JQ" -r '.hook_event_name // empty' 2>/dev/null)"
tool="$(printf '%s' "$input" | "$JQ" -r '.tool_name // empty' 2>/dev/null)"
cwd="$(printf '%s' "$input" | "$JQ" -r '.cwd // empty' 2>/dev/null)"

# On n'intercepte que les outils figma-console ; tout le reste passe.
case "$tool" in
  mcp__figma-console__*) ;;
  *) exit 0 ;;
esac

# Instrument absent de ce repo/worktree -> convention non applicable, on ne
# bloque jamais un autre projet qui a aussi figma-console d'installé.
[ -n "$cwd" ] && [ -d "$cwd/extract/figma/page-parity" ] || exit 0

# Verbes qui mutent le canvas (préfixes, même style que le hook auggie).
is_mutating=0
case "$tool" in
  mcp__figma-console__figma_set_*|mcp__figma-console__figma_resize_*|\
  mcp__figma-console__figma_move_*|mcp__figma-console__figma_delete_*|\
  mcp__figma-console__figma_create_*|mcp__figma-console__figma_rename_*|\
  mcp__figma-console__figma_clone_*|mcp__figma-console__figma_instantiate_*|\
  mcp__figma-console__figma_add_*|mcp__figma-console__figma_edit_*|\
  mcp__figma-console__figma_reorder_*|mcp__figma-console__figma_reset_*|\
  mcp__figma-console__figma_duplicate_*|mcp__figma-console__figma_append_*|\
  mcp__figma-console__figma_import_library_variable|\
  mcp__figma-console__figma_update_variable|\
  mcp__figma-console__figma_arrange_component_set)
    is_mutating=1 ;;
esac

is_execute=0
[ "$tool" = "mcp__figma-console__figma_execute" ] && is_execute=1

if [ "$event" = "PreToolUse" ]; then
  # figma_execute n'est jamais bloqué ici : trop générique pour classer
  # fiablement lecture/mutation depuis le nom seul (limite nommée ci-dessus).
  [ "$is_mutating" -eq 1 ] || exit 0
  recent="$(find "$cwd/.page-parity" -type f -mmin -5 2>/dev/null | head -1)"
  if [ -z "$recent" ]; then
    "$JQ" -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Mutation figma-console sans capture avant récente (<5 min) sous .page-parity/. Règle before-capture : capture TOUTE cible concernée (bridge/capture.js) + checkpoint (bridge/checkpoint.js) AVANT de muter — jamais un sous-ensemble pilote. Si déjà fait : la capture est trop vieille ou hors .page-parity/, relance-la."
      }
    }'
    exit 0
  fi
  exit 0
fi

if [ "$event" = "PostToolUse" ] && { [ "$is_mutating" -eq 1 ] || [ "$is_execute" -eq 1 ]; }; then
  if [ "$is_execute" -eq 1 ]; then
    msg='figma_execute vient de tourner — ce hook ne sait pas si le script était une lecture (scan/capture) ou une mutation réelle du canvas (limite nommée). Si c'\''était une mutation : capture AVANT/APRÈS + `npm run pages:compare` avant de déclarer l'\''incrément prouvé.'
  else
    msg='Mutation figma-console effectuée. Rappel : capture APRÈS + `npm run pages:compare` avant de déclarer l'\''incrément prouvé (sinon la preuve pixel manque, cf. leçon gallery-item).'
  fi
  "$JQ" -n --arg m "$msg" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $m}}'
  exit 0
fi

exit 0
