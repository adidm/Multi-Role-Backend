import Products from "../models/ProductModel.js";
import Users from "../models/UserModel.js";
import { Op } from "sequelize";

export const getProducts = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Products.findAll({
                attributes: ["uuid", "name", "price"],
                include: [{
                    model: Users,
                    attributes: ["uuid", "name", "email", "role"]
                }]
            });
        } else {
            response = await Products.findAll({
                attributes: ["uuid", "name", "price"],
                where: {
                    userId: req.userId //req set by verifyUser middleware
                },
                include: [{
                    model: Users,
                    attributes: ["uuid", "name", "email", "role"]
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(error.message);
    }
}
export const getProductById = async (req, res) => {
    try {
        let response;
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!product) return res.status(404).json({ msg: "Produk tidak ada" });
        if (req.role === "admin") {
            response = await Products.findOne({
                attributes: ["uuid", "name", "price"],
                where: {
                    id: product.id
                },
                include: [{
                    model: Users,
                    attributes: ["uuid", "name", "email", "role"]
                }]
            });
        } else {
            response = await Products.findOne({
                attributes: ["uuid", "name", "price"],
                where: {
                    [Op.and]: [{ id: product.id }, { userId: req.userId }] // req.userId refers to id user who login
                },
                include: [{
                    model: Users,
                    attributes: ["uuid", "name", "email", "role"]
                }]
            });

        }
        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }

}
export const createProduct = async (req, res) => {
    const { name, price } = req.body;
    const isProductExist = await Products.findOne({
        where: {
            name: name,
            price: price
        }
    });
    if (isProductExist) return res.status(409).json({ msg: "Produk sudah ada" });
    try {
        await Products.create({
            name,
            price,
            userId: req.userId // req.userId set by verifyUser middleware
        });
        res.status(200).json({ msg: "Produk Berhasil Dibuat" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
export const updateProduct = async (req, res) => {
    try {
        const { name, price } = req.body;
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!product) return res.status(404).json({ msg: "Produk tidak ada" });
        if (req.role === "admin") {
            await Products.update({ name, price }, {
                where: {
                    id: product.id
                }
            });
        } else {
            if (req.userId !== product.userId) return res.status(403).json({ msg: "Akses terlarang" });
            await Products.update({ name, price }, {
                where: {
                    [Op.and]: [{ id: product.id }, { userId: req.userId }]
                }
            });
        }
        res.status(200).json({ msg: "Produk berhasil di update" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
        console.log(error.message);
    }
}
export const deleteProduct = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan" });
        if (req.role === "admin") {
            await Products.destroy({
                where: {
                    id: product.id
                }
            });
        } else {
            if (req.userId !== product.userId) return res.status(403).json({ msg: "Akses terlarang" });
            await Products.destroy({
                where: {
                    [Op.and]: [{ id: product.id }, { userId: req.userId }]
                }
            });
        }
        res.status(200).json({ msg: "Produk berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
