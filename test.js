import assert from 'node:assert/strict'
import test from 'node:test'
import miniProgramBuiltinComponents from './index.js'

test('Main', () => {
  assert.ok(Array.isArray(miniProgramBuiltinComponents))
  assert.deepEqual(
    miniProgramBuiltinComponents,
    miniProgramBuiltinComponents.toSorted(),
  )
  assert.equal(
    miniProgramBuiltinComponents.length,
    new Set(miniProgramBuiltinComponents).size,
  )
})
