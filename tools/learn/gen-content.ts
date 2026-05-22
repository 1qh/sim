#!/usr/bin/env bun
/** biome-ignore-all lint/performance/noAwaitInLoops: sequential file writes */
/* eslint-disable no-console, no-await-in-loop */
import { $ } from 'bun'
import { mkdir, writeFile } from 'node:fs/promises'
import { KMAP_EXAMPLES, LEARN_PAGES, MIPS_EXAMPLES } from '../../apps/web/src/features/learn/manifest'

const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const root = `${repoRoot}/apps/web/content`
const BODY: Record<string, string> = {
  'cross-link-derive-control-in-kmap':
    'The headline link: the Control unit is nine Boolean functions of the opcode bits. Each one can be minimized in a K-map, and the minimized expression IS the actual logic wired into the datapath.\n\n## 1. The RegDst truth table\n\nRegDst as a function of the opcode bits across the locked instruction set. R-type sets it 1; loads/stores/branches set it 0 or don’t-care.\n\n<TruthTable headers={["op","RegDst"]} rows={[[0,1],[1,0]]} />\n\n## 2. Group it yourself\n\nSelect cells to form prime-implicant groups, then reveal the solver’s minimal cover and compare.\n\n<KmapInteractive vars={4} minterms={[0,1,2,5,8,9]} />\n\n## 3. Show this function in the datapath\n\nStep any instruction: the Control unit emits RegDst, the RegDst mux selects rt vs rd, and the K-map cell for that opcode is exactly the value driving the mux. Same function, two views.\n\n<DatapathStep instruction="add" step="ID" />\n<DatapathStep instruction="lw" step="ID" />\n\n## 4. The point\n\nK-map theory and datapath practice are the same thing. Try ALUSrc and MemToReg — each is its own K-map exercise on this site, and each drives a real mux you can watch fire.',
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
const PROG: Record<string, string> = {
  'all-branch':
    'addi $t0, $zero, 2\nbeq $t0, $zero, a\nbne $t0, $zero, b\na:\nj c\nb:\naddi $t0, $t0, -1\nbeq $t0, $zero, c\nj b\nc:',
  'all-i-type': 'addi $t0, $zero, 7\nandi $t1, $t0, 3\nori $t2, $t1, 8\nlui $t3, 1\nlw $t4, 0($t0)\nsw $t4, 4($t0)',
  'all-r-type':
    'add $t0, $t1, $t2\nsub $t3, $t0, $t1\nand $t4, $t3, $t0\nor $t5, $t4, $t3\nslt $t6, $t5, $t4\nnor $t7, $t6, $t5',
  'alu-only':
    'addi $t0, $zero, 6\naddi $t1, $zero, 9\nadd $t2, $t0, $t1\nsub $t3, $t1, $t0\nand $t4, $t2, $t3\nor $t5, $t2, $t3\nslt $t6, $t0, $t1',
  'array-sum':
    'addi $t2, $zero, 4\nadd $t1, $zero, $zero\nsum:\nlw $t3, 0($t0)\nadd $t1, $t1, $t3\naddi $t0, $t0, 4\naddi $t2, $t2, -1\nbne $t2, $zero, sum',
  'branch-heavy': 'addi $t0, $zero, 5\nb1:\nbeq $t0, $zero, b2\naddi $t0, $t0, -1\nj b1\nb2:\nbne $t0, $zero, b1',
  'bubble-sort':
    'addi $t5, $zero, 3\nouter:\nadd $t0, $zero, $zero\ninner:\nlw $t1, 0($t0)\nlw $t2, 4($t0)\nslt $t3, $t2, $t1\nbeq $t3, $zero, nx\nsw $t2, 0($t0)\nsw $t1, 4($t0)\nnx:\naddi $t0, $t0, 4\naddi $t5, $t5, -1\nbne $t5, $zero, outer',
  'critical-path-worst': 'lw $t0, 0($t1)\nadd $t2, $t0, $t3\nsw $t2, 4($t1)',
  factorial:
    'addi $t0, $zero, 5\naddi $t1, $zero, 1\nf:\nbeq $t0, $zero, end\nadd $t1, $t1, $t1\naddi $t0, $t0, -1\nj f\nend:',
  fibonacci:
    'addi $t0, $zero, 0\naddi $t1, $zero, 1\naddi $t3, $zero, 10\nfib:\nadd $t2, $t0, $t1\nadd $t0, $zero, $t1\nadd $t1, $zero, $t2\naddi $t3, $t3, -1\nbne $t3, $zero, fib',
  'forwarding-resolvable': 'add $t0, $t1, $t2\nadd $t3, $t0, $t1\nsub $t4, $t3, $t0',
  gcd: 'g:\nbeq $t0, $t1, done\nslt $t2, $t0, $t1\nbne $t2, $zero, swap\nsub $t0, $t0, $t1\nj g\nswap:\nsub $t1, $t1, $t0\nj g\ndone:',
  hello: 'addi $t0, $zero, 72\naddi $t1, $zero, 105',
  'load-use-hazard': 'lw $t0, 0($t1)\nadd $t2, $t0, $t0\nsub $t3, $t2, $t1',
  'memory-copy':
    'addi $t2, $zero, 4\nmc:\nlw $t3, 0($t0)\nsw $t3, 0($t1)\naddi $t0, $t0, 4\naddi $t1, $t1, 4\naddi $t2, $t2, -1\nbne $t2, $zero, mc',
  'power-of-two': 'addi $t0, $zero, 1\naddi $t1, $zero, 8\np:\nsll $t0, $t0, 1\naddi $t1, $t1, -1\nbne $t1, $zero, p',
  'pseudo-zoo': 'li $t0, 0x12345678\nmove $t1, $t0\nnop\nbeqz $t1, z\nbnez $t0, z\nz:',
  'slow-alu-experiment': 'add $t0, $t1, $t2\nor $t3, $t0, $t1\nslt $t4, $t3, $t0\nnor $t5, $t4, $t3',
  'string-length':
    'add $t1, $zero, $zero\nsl:\nlw $t2, 0($t0)\nbeq $t2, $zero, sd\naddi $t1, $t1, 1\naddi $t0, $t0, 4\nj sl\nsd:',
  'sum-1-n':
    'addi $t0, $zero, 10\nadd $t1, $zero, $zero\nloop:\nadd $t1, $t1, $t0\naddi $t0, $t0, -1\nbne $t0, $zero, loop'
}
for (const slug of MIPS_EXAMPLES) {
  const asm = PROG[slug] ?? `addi $t0, $zero, ${slug.length}`
  const md = `---\ntitle: "${slug}"\nslug: ${slug}\nkind: mips\ntags: [mips, example]\n---\n\n# ${slug}\n\nMIPS program — ${slug.replaceAll('-', ' ')}.\n\n\`\`\`asm-mips\n${asm}\n\`\`\`\n`
  await writeFile(`${exDir}/mips/${slug}.mdx`, md)
  written += 1
}
const KFN: Record<string, { m: number[]; v: number }> = {
  '2var-and': { m: [3], v: 2 },
  '2var-xor': { m: [1, 2], v: 2 },
  '3var-majority': { m: [3, 5, 6, 7], v: 3 },
  '3var-xor': { m: [1, 2, 4, 7], v: 3 },
  '4var-bcd-7seg-a': { m: [0, 2, 3, 5, 6, 7, 8, 9], v: 4 },
  '4var-bcd-7seg-g': { m: [2, 3, 4, 5, 6, 8, 9], v: 4 },
  '4var-dont-cares': { m: [0, 1, 2, 4, 5, 8, 10], v: 4 },
  '4var-full-adder-carry': { m: [3, 5, 6, 7, 11, 13, 14, 15], v: 4 },
  '4var-full-adder-sum': { m: [1, 2, 4, 7, 8, 11, 13, 14], v: 4 },
  '4var-hazard': { m: [0, 1, 3, 2, 6, 7], v: 4 },
  '4var-mux-selector': { m: [1, 3, 6, 7, 9, 11, 14, 15], v: 4 },
  '5var-majority': { m: [7, 11, 13, 14, 15, 19, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31], v: 5 },
  '5var-parity': { m: [1, 2, 4, 7, 8, 11, 13, 14, 16, 19, 21, 22, 25, 26, 28, 31], v: 5 },
  '6var-demo': { m: [0, 1, 8, 9, 16, 17, 32, 33], v: 6 },
  'cross-link-alusrc': { m: [3, 7, 11, 12, 13, 14, 15], v: 4 },
  'cross-link-regdst': { m: [0, 1, 2, 5, 8, 9], v: 4 },
  'multi-2bit-comparator': { m: [1, 2, 3, 6, 7, 11], v: 4 },
  'multi-bcd-7seg': { m: [0, 2, 3, 5, 6, 7, 8, 9], v: 4 },
  'multi-full-adder': { m: [1, 2, 4, 7], v: 3 },
  'multi-half-adder': { m: [1, 2], v: 2 }
}
for (const slug of KMAP_EXAMPLES) {
  const f = KFN[slug] ?? { m: [1, 2], v: 2 }
  const md = `---\ntitle: "${slug}"\nslug: ${slug}\nkind: kmap\ntags: [kmap, example]\n---\n\n# ${slug}\n\nK-map exercise — ${slug.replaceAll('-', ' ')}. Group the cells, then reveal the solver.\n\n<KmapInteractive vars={${f.v}} minterms={[${f.m.join(',')}]} />\n`
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
