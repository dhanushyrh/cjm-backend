import User from "./User";
import Scheme from "./Scheme";
import UserScheme from "./UserScheme";

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
}; 