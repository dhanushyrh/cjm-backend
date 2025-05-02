import User from "./User";
import Scheme from "./Scheme";
import UserScheme from "./UserScheme";
import Transaction from "./Transaction";
import GoldPrice from "./GoldPrice";
import RedemptionRequest from "./RedemptionRequest";
import Admin from "./Admin";
import PaymentDetails from "./PaymentDetails";
import Referral from "./Referral";
import Circular from "./Circular";
import CircularView from "./CircularView";
import Settings from "./Settings";
import File from "./File";
import SchemeRequest from "./SchemeRequest";
import Notification from "./Notification";

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

  // PaymentDetails <-> UserScheme associations
  PaymentDetails.hasOne(UserScheme, {
    foreignKey: "payment_details_id",
    as: "userScheme"
  });
  UserScheme.belongsTo(PaymentDetails, {
    foreignKey: "payment_details_id",
    as: "paymentDetails"
  });

  // User <-> Referral associations
  User.hasMany(Referral, {
    foreignKey: "userId",
    as: "userReferrals"
  });
  Referral.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
  });

  // Circular <-> CircularView associations
  Circular.hasMany(CircularView, {
    foreignKey: "circularId",
    as: "views"
  });
  CircularView.belongsTo(Circular, {
    foreignKey: "circularId",
    as: "circular"
  });

  // User <-> CircularView associations
  User.hasMany(CircularView, {
    foreignKey: "userId",
    as: "circularViews"
  });
  CircularView.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
  });

  // Scheme Request associations
  SchemeRequest.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  User.hasMany(SchemeRequest, {
    foreignKey: "userId",
    as: "schemeRequests",
  });

  // Notification associations
  Notification.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  User.hasMany(Notification, {
    foreignKey: "userId",
    as: "notifications",
  });
}; 