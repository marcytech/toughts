const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('toughts2', 'root', '_Nano2503*',{
  host:'localhost',
  dialect: 'mysql'
})

try{
  sequelize.authenticate()
  console.log('Conectamos com sucesso')
}catch(err) {
  console.log(`Nao foi possivel conectar ${err}`)
}

module.exports = sequelize