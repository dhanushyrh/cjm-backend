import User from "./User";
import Scheme from "./Scheme";
import UserScheme from "./UserScheme";
import Transaction from "./Transaction";
import GoldPrice from "./GoldPrice";
import RedemptionRequest from "./RedemptionRequest";
import Admin from "./Admin";

export const setupAssociations = () => {
  // User <-> UserScheme associations
  User.hasMany(UserScheme, {
    foreignKey: "userId",
    as: "schemes"
  });
  UserScheme.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
  });

  // Scheme <-> UserScheme associations
  Scheme.hasMany(UserScheme, {
    foreignKey: "schemeId",
    as: "users"
  });
  UserScheme.belongsTo(Scheme, {
    foreignKey: "schemeId",
    as: "scheme"
  });

  // UserScheme <-> Transaction associations
  UserScheme.hasMany(Transaction, {
    foreignKey: "userSchemeId",
    as: "transactions"
  });
  Transaction.belongsTo(UserScheme, {
    foreignKey: "userSchemeId",
    as: "userScheme"
  });

  // Transaction <-> GoldPrice associations
  Transaction.belongsTo(GoldPrice, {
    foreignKey: "priceRefId",
    as: "goldPrice"
  });

  // UserScheme <-> RedemptionRequest associations
  UserScheme.hasMany(RedemptionRequest, {
    foreignKey: "userSchemeId",
    as: "redemptionRequests"
  });
  RedemptionRequest.belongsTo(UserScheme, {
    foreignKey: "userSchemeId",
    as: "userScheme"
  });

  // Admin <-> RedemptionRequest associations
  Admin.hasMany(RedemptionRequest, {
    foreignKey: "approvedBy",
    as: "approvedRequests"
  });
  RedemptionRequest.belongsTo(Admin, {
    foreignKey: "approvedBy",
    as: "admin"
  });
}; 