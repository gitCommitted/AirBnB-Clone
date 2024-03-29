'use strict';
const { Model, Validator } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    toSafeObject() {
      const { id, userName, email } = this; // context will be the User instance
      return { id, userName, email };
    }
    validatePassword(password) {
      return bcrypt.compareSync(password, this.hashedPassword.toString());
    }
    static getCurrentUserById(id) {
      return User.scope("currentUser").findByPk(id);
    }
    static async login({ email, password }) {
      const { Op } = require('sequelize');
      const user = await User.scope('loginUser').findOne({
        where: {
          
            email: email
          
        }
      });
      if (user && user.validatePassword(password)) {
        return await User.scope('currentUser').findByPk(user.id);
      }
    }
    static async signup({ userName, email, password }) {
      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({
        userName,
        email,
        hashedPassword
      });
      return await User.scope('currentUser').findByPk(user.id);
    }





    static associate(models) {
      User.hasMany(
        models.Spot,
        {foreignKey: 'ownerId'}
      )
      User.hasMany(
        models.Review,
        {foreignKey: 'userId'}
      )
      User.hasMany(
        models.Booking,
        {foreignKey: 'userId'}
      )
    }
  };
  
  User.init(
    {
      userName: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 256]
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      }
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        attributes: {
          exclude: ["hashedPassword","createdAt", "updatedAt"]
        }
      },
      scopes: {
        currentUser: {
          attributes: { exclude: ["hashedPassword"] }
        },
        loginUser: {
          attributes: {}
        }
      }
    }
  );
  return User;
};