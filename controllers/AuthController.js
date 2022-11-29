const User = require("../models/User")

const bcrypt = require("bcryptjs")

module.exports = class AuthController {
	static login(req, res) {
		res.render("auth/login")
	}

  static async loginPost(req, res) {


    const { email, password} = req.body

    const user = await User.findOne({where: {email: email}})



    if(!user) {
      req.flash('message', 'Usuário não encontrado!')
      res.render('auth/login')

      return
    }

    const passwordMatch = bcrypt.compareSync(password, user.password)

    if(!passwordMatch) {
      req.flash('message', 'Senha inválida!')
      res.render('auth/login')

      return
    }

    req.session.userId = user.id

    req.flash('message', 'Autenticação realizada com sucesso')

    req.session.save(() => {
      res.redirect('/toughts/dashboard') 
    })

    
  }

	static register(req, res) {
		res.render("auth/register")
	}

	static async registerPost(req, res) {
		const { name, email, password, confirmpassword } = req.body

    if(password != confirmpassword) {
      req.flash('message', 'As senhas não conferem, tente novamente!')
      res.render('auth/register')

      return
    }

    const chackIfUserExists = await User.findOne({ where: { email: email}})

    if(chackIfUserExists) {
      req.flash('message', 'O e-mail ja está em uso!')
      res.render('auth/register')

      return
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassaword = bcrypt.hashSync(password, salt)

    const user = {
      name,
      email,
      password: hashedPassaword
    }

    try{
     const createdUser = await User.create(user)

      req.session.userId = createdUser.id

      req.flash('message', 'Cadastra realizado com sucesso!')

      req.session.save(() => {
        res.redirect('/') 
      })
     
    }catch(err) {
      console.log(err)
    }
	}

  static logout(req, res) {
    req.session.destroy()
    res.redirect('/login')
  }
}
