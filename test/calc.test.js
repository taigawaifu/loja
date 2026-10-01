const { somar } = require("../models/calculadora.test");

test("somar 2+2 deveria ser 4",()=>{
  const resultado =somar(2,2)
  expect(resultado).toBe(4)
})
test("somar 100+5 deveria ser 4",()=>{
  const resultado =somar(100,5)
  expect(resultado).toBe(105)
})