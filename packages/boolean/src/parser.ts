/** biome-ignore-all lint/nursery/noExcessiveClassesPerFile: chevrotain parser + visitor */
/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
/** biome-ignore-all lint/nursery/useGlobalThis: noise */
/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/** biome-ignore-all lint/suspicious/noMisplacedAssertion: noise */
/** biome-ignore-all lint/nursery/noComponentHookFactories: noise */
/** biome-ignore-all lint/nursery/noContinue: noise */
/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/** biome-ignore-all lint/performance/noNamespaceImport: noise */
/** biome-ignore-all lint/complexity/noUselessStringRaw: noise */
/** biome-ignore-all lint/complexity/useMaxParams: noise */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name */
/* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-void-return, max-classes-per-file */
import { createToken, CstParser, Lexer } from 'chevrotain'
import type { Expr } from './ast'
import { and, c, not, or, v, xor } from './ast'

const Identifier = createToken({ name: 'Identifier', pattern: /[a-zA-Z_][\w]*/u })
const True = createToken({ longer_alt: Identifier, name: 'True', pattern: /1\b|true|TRUE/u })
const False = createToken({ longer_alt: Identifier, name: 'False', pattern: /0\b|false|FALSE/u })
const AndOp = createToken({ name: 'AndOp', pattern: /&&|&|\*|·|\.|\bAND\b|\band\b/u })
const OrOp = createToken({ name: 'OrOp', pattern: /\|\||\||\+|\bOR\b|\bor\b/u })
const XorOp = createToken({ name: 'XorOp', pattern: /\^|⊕|\bXOR\b|\bxor\b/u })
const NotOp = createToken({ name: 'NotOp', pattern: /!|~|¬|\bNOT\b|\bnot\b/u })
const LParen = createToken({ name: 'LParen', pattern: /\(/u })
const RParen = createToken({ name: 'RParen', pattern: /\)/u })
const WhiteSpace = createToken({ group: Lexer.SKIPPED, name: 'WhiteSpace', pattern: /\s+/u })
const tokens = [WhiteSpace, True, False, AndOp, OrOp, XorOp, NotOp, LParen, RParen, Identifier]
const lexer = new Lexer(tokens)
class BoolParser extends CstParser {
  public andExpr = this.RULE('andExpr', () => {
    this.SUBRULE(this.notExpr)
    this.MANY(() => {
      this.CONSUME(AndOp)
      this.SUBRULE2(this.notExpr)
    })
  })
  public atomExpr = this.RULE('atomExpr', () => {
    this.OR([
      { ALT: () => this.CONSUME(Identifier) },
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      {
        ALT: () => {
          this.CONSUME(LParen)
          this.SUBRULE(this.expr)
          this.CONSUME(RParen)
        }
      }
    ])
  })
  public expr = this.RULE('expr', () => this.SUBRULE(this.orExpr))
  public notExpr = this.RULE('notExpr', () => {
    this.MANY(() => this.CONSUME(NotOp))
    this.SUBRULE(this.atomExpr)
  })
  public orExpr = this.RULE('orExpr', () => {
    this.SUBRULE(this.xorExpr)
    this.MANY(() => {
      this.CONSUME(OrOp)
      this.SUBRULE2(this.xorExpr)
    })
  })
  public xorExpr = this.RULE('xorExpr', () => {
    this.SUBRULE(this.andExpr)
    this.MANY(() => {
      this.CONSUME(XorOp)
      this.SUBRULE2(this.andExpr)
    })
  })
  public constructor() {
    super(tokens)
    this.performSelfAnalysis()
  }
}
const parserInstance = new BoolParser()
const BaseVisitor = parserInstance.getBaseCstVisitorConstructor()
interface CstChildren {
  andExpr?: { children: CstChildren }[]
  AndOp?: unknown[]
  atomExpr?: { children: CstChildren }[]
  expr?: { children: CstChildren }[]
  False?: unknown[]
  Identifier?: { image: string }[]
  notExpr?: { children: CstChildren }[]
  NotOp?: unknown[]
  orExpr?: { children: CstChildren }[]
  OrOp?: unknown[]
  True?: unknown[]
  xorExpr?: { children: CstChildren }[]
  XorOp?: unknown[]
}
class BoolVisitor extends BaseVisitor {
  public constructor() {
    super()
    this.validateVisitor()
  }
  public andExpr(ctx: CstChildren): Expr {
    const operands = ((ctx.notExpr ?? []) as never[]).map(n => this.visit(n) as Expr)
    return operands.reduce((acc, cur) => and(acc, cur))
  }
  public atomExpr(ctx: CstChildren): Expr {
    if (ctx.Identifier) {
      const ident = (ctx.Identifier as { image: string }[])[0]
      if (ident === undefined) throw new Error('atom: empty Identifier')
      return v(ident.image)
    }
    if (ctx.True) return c(1)
    if (ctx.False) return c(0)
    return this.visit(ctx.expr as never) as Expr
  }
  public expr(ctx: CstChildren): Expr {
    return this.visit(ctx.orExpr as never) as Expr
  }
  public notExpr(ctx: CstChildren): Expr {
    const inner = this.visit(ctx.atomExpr as never) as Expr
    const negations = ctx.NotOp?.length ?? 0
    let out = inner
    for (let i = 0; i < negations; i += 1) out = not(out)
    return out
  }
  public orExpr(ctx: CstChildren): Expr {
    const operands = ((ctx.xorExpr ?? []) as never[]).map(n => this.visit(n) as Expr)
    return operands.reduce((acc, cur) => or(acc, cur))
  }
  public xorExpr(ctx: CstChildren): Expr {
    const operands = ((ctx.andExpr ?? []) as never[]).map(n => this.visit(n) as Expr)
    return operands.reduce((acc, cur) => xor(acc, cur))
  }
}
const visitor = new BoolVisitor()
const parse = (text: string): Expr => {
  const lex = lexer.tokenize(text)
  if (lex.errors.length > 0) throw new Error(`lex error: ${(lex.errors[0] as { message: string }).message}`)
  parserInstance.input = lex.tokens
  const cst = parserInstance.expr()
  if (parserInstance.errors.length > 0)
    throw new Error(`parse error: ${(parserInstance.errors[0] as { message: string }).message}`)
  return visitor.visit(cst) as Expr
}
export { parse }
