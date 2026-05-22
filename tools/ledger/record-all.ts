#!/usr/bin/env bun
/** biome-ignore-all lint/style/noProcessEnv: passes tree/commit to child gate procs */
/* eslint-disable no-console */
import process from 'node:process'
import { ledgerEnv, runPool } from './pool'
import { GATES } from './record-all-gates'

process.env = { ...process.env, ...(await ledgerEnv()) }
const failed = await runPool(GATES)
console.log(`done: ${GATES.length - failed} green / ${GATES.length} total`)
process.exit(failed > 0 ? 1 : 0)
