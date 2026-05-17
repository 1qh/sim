#!/usr/bin/env bun
/** biome-ignore-all lint/nursery/noContinue: gen */
/** biome-ignore-all lint/performance/noAwaitInLoops: sequential file writes */
/* eslint-disable no-console, no-await-in-loop */
import { $ } from 'bun'
import { mkdir, writeFile } from 'node:fs/promises'
import { KMAP_EXAMPLES, LEARN_PAGES, MIPS_EXAMPLES } from '../../apps/web/src/features/learn/manifest'
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const root = `${repoRoot}/apps/web/content`
const BODY: Record<string, string> = {
  'cross-link-derive-control-in-kmap':
    'The Control unit is nine Boolean functions of the opcode bits. Each can be minimized in a K-map — and the result is the actual logic in the datapath. Group the cells, then watch the same function fire as instructions step through the datapath.\n\n<KmapView vars={4} minterms={[0,1,2,5,8,9]} />\n\n<DatapathView instruction="add" />',
  'datapath-branch-resolution':
    'Branches use the ALU as a comparator (subtract, check zero). Branch ∧ Zero gates PCSrc; the target is computed in parallel by the branch adder.\n\n<Signal instruction="beq" name="Branch" />',
  'datapath-critical-path':
    'Clock period is bounded by the worst-case path. `lw` is worst-case under typical delays; editing delays shifts the bottleneck.\n\n<DatapathView instruction="lw" />',
  'datapath-i-type-walkthrough':
    'I-type adds an immediate operand instead of a second register. ALUSrc flips; sign-extend feeds the second ALU input.\n\n<Signal instruction="addi" name="ALUSrc" />',
  'datapath-load-store-anatomy':
    'Loads use the ALU as an address computer, then read data memory. Stores write data memory. Compare MemRead, MemWrite, MemToReg.\n\n<DatapathView instruction="lw" />',
  'datapath-r-type-walkthrough':
    'Step through `add`: IF fetches, ID decodes and reads registers, EX computes, MEM is idle, WB writes the result.\n\n<DatapathView instruction="add" />',
  'intro-control-signals':
    'The Control unit reads the opcode and decides what every mux and memory does this cycle — nine binary decisions per instruction.\n\n<DatapathView instruction="lw" />',
  'intro-instruction-anatomy':
    'An instruction is a 32-bit number with structured fields. The CPU reads it as fields, not as a number.\n\n<TruthTable headers={["opcode","rs","rt"]} rows={[[0,1,1],[1,0,1]]} />',
  'intro-what-is-a-datapath':
    'A datapath is the physical road instructions travel. Components are stops along the road; different instructions take different routes through the same road.\n\n<DatapathView instruction="add" />',
  'kmap-five-six-var-toroid':
    'Five and six variables wrap in two dimensions. The 2D split-map hides the wraparound; the torus shows the genuine adjacency.\n\n<KmapView vars={5} minterms={[0,1,5,7,16,20]} />',
  'kmap-grouping-rules':
    'Group adjacent 1s in 2^k rectangles; bigger groups mean fewer literals. Wraparound is allowed.\n\n<KmapView vars={4} minterms={[0,1,5,7,8,9,13]} />',
  'kmap-hazard-analysis':
    'A glitch happens when input transitions between minterms in different groups. A redundant PI covering the transition removes the static hazard.\n\n<KmapView vars={4} minterms={[0,1,3,2,6,7]} />',
  'kmap-prime-implicants':
    'A prime implicant is a group that cannot be enlarged. An essential PI covers a minterm no other PI does.\n\n<KmapView vars={4} minterms={[0,2,5,7,8,10,13,15]} />',
  'kmap-truth-tables':
    'A Boolean function is a truth table is a K-map — three views of the same thing.\n\n<KmapView vars={2} minterms={[1,2]} />',
  'pipeline-forwarding':
    'Route a stage’s output directly to a later consumer, skipping the write-back-then-read round trip. Load-use is the one case forwarding cannot resolve.',
  'pipeline-hazards':
    'When instruction N+1 needs N’s result before write-back, the pipeline must stall. RAW, WAW, WAR, and control hazards each have a detection rule.',
  'pipeline-stages': 'Split execution into five stages and overlap instructions. CPI approaches one as the pipeline fills.'
}
const learnDir = `${root}/learn`
let written = 0
for (const p of LEARN_PAGES) {
  await mkdir(learnDir, { recursive: true })
  const nav = [p.prev ? `[← ${p.prev}](/learn/${p.prev})` : '', p.next ? `[${p.next} →](/learn/${p.next})` : '']
    .filter(Boolean)
    .join(' · ')
  const md = `# ${p.title}\n\n${BODY[p.slug] ?? `Lesson: ${p.title}.`}\n\n---\n\n${nav}\n`
  await writeFile(`${learnDir}/${p.slug}.mdx`, md)
  written += 1
}
const exDir = `${root}/examples`
await mkdir(`${exDir}/mips`, { recursive: true })
await mkdir(`${exDir}/kmap`, { recursive: true })
for (const slug of MIPS_EXAMPLES) {
  const md = `---\ntitle: "${slug}"\nslug: ${slug}\nkind: mips\ntags: [mips, example]\n---\n\n# ${slug}\n\nMIPS example program: ${slug}.\n\n\`\`\`asm-mips\naddi $t0, $zero, 1\nadd $t1, $t0, $t0\n\`\`\`\n`
  await writeFile(`${exDir}/mips/${slug}.mdx`, md)
  written += 1
}
for (const slug of KMAP_EXAMPLES) {
  const md = `---\ntitle: "${slug}"\nslug: ${slug}\nkind: kmap\ntags: [kmap, example]\n---\n\n# ${slug}\n\nK-map exercise: ${slug}.\n\n<KmapView vars={3} minterms={[1,2,4,7]} />\n`
  await writeFile(`${exDir}/kmap/${slug}.mdx`, md)
  written += 1
}
const header = [
  '/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */',
  '/** biome-ignore-all lint/performance/noNamespaceImport: noise */',
  '/* oxlint-disable import/no-duplicates */',
  '/* GENERATED by tools/learn/gen-content.ts — do not edit */'
].join('\n')
const imports = LEARN_PAGES.map((p, i) => `import L${i} from '@content/learn/${p.slug}.mdx'`).join('\n')
const entries = LEARN_PAGES.map((p, i) => `  '${p.slug}': L${i}`).join(',\n')
const registry = `${header}\nimport type { FC } from 'react'\n${imports}\nconst LEARN_REGISTRY: Record<string, FC> = {\n${entries}\n}\nexport { LEARN_REGISTRY }\n`
await writeFile(`${repoRoot}/apps/web/src/features/learn/registry.ts`, registry)
console.log(`ok gen-content ${written} files`)
