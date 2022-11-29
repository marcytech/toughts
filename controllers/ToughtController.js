const sequelize = require("../db/conn")
const Tought = require("../models/Tought")
const User = require("../models/User")


const { Op } = require('sequelize')

module.exports = class ToughtController {

	static async queryByTerm (order, search){
		return await Tought.findAll({
			include: User,
			where: {
				title: { [Op.like]: `%${search}%`}
			},
			order:[['createdAt', order]],
		})
	}

	static async queryAll (order){
		return await Tought.findAll({
			order:[['createdAt', order]],
		})
	}


	static render(toughtsData, response, search = null){
		const toughts = toughtsData.map((result) => result.get({plain: true}))
		const toughtsQty = toughts.length

		response.render("toughts/home", {toughts, search, toughtsQty})
	}

	static async showToughts(req, res) {

		const search = req?.query?.search
		const order = req.query.order === 'old' ? 'DESC' : 'ASC'

		if(!search){
			const data = await ToughtController.queryAll(order)
			ToughtController.render(data, res)
			return
		}

		const data = await ToughtController.queryByTerm(order, search)
		ToughtController.render(data, res, search)


	}

	static async dashboard(req, res) {
		const userId = req.session.userId

		const user = await User.findOne({
			where: {
				id: userId,
			},
			include: Tought,
			plain: true,
		})

		if (!user) {
			res.redirect("/login")
		}

		const toughts = user.Toughts.map((result) => result.dataValues)

		let emtyToughts = false

		if (toughts.length === 0) {
			emtyToughts = true
		}

		res.render("toughts/dashboard", { toughts, emtyToughts })
	}

	static createTought(req, res) {
		res.render("toughts/create")
	}

	static async createToughtSave(req, res) {
		const tought = {
			title: req.body.title,
			UserId: req.session.userId,
		}
		try {
			await Tought.create(tought)

			req.flash("message", "Pensamento criado com sucesso!")

			req.session.save(() => {
				res.redirect("/toughts/dashboard")
			})
		} catch (error) {
			console.log(error)
		}
	}

	static async removeTought(req, res) {
		const id = req.body.id
		const UserId = req.session.userId

		try {
			await Tought.destroy({ where: { id: id, UserId: UserId } })

			req.flash("message", "Pensamento removido com sucesso!")
			req.session.save(() => {
				res.redirect("/toughts/dashboard")
			})
		} catch (error) {
			console.log("Aconteceu um erro:" + error)
		}
	}

	static async updateTought(req, res) {
		const id = req.params.id

		const tought = await Tought.findOne({ where: { id: id }, raw: true })

		res.render("toughts/edit", { tought })
	}

	static async updateToughtSave(req, res) {
		const id = req.body.id

		const tought = {
			title: req.body.title,
		}

		try {
			await Tought.update(tought, { where: { id: id } })
			req.flash("message", "Pensamento atualizado com sucesso!")

			req.session.save(() => {
				res.redirect("/toughts/dashboard")
			})
		} catch (error) {
			console.log("Aconteceu um erro:" + error)
		}
	}
}
