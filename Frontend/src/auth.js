import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

import { poolData } from "./cognitoConfig";

const userPool = new CognitoUserPool(poolData);

// ==========================
// 🟢 REGISTRO
// ==========================
export const register = (email, password) => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// ==========================
// 🟢 CONFIRMAR USUARIO
// ==========================
export const confirmUser = (email, code) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    user.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// ==========================
// 🟢 LOGIN
// ==========================
export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        resolve(token);
      },
      onFailure: (err) => reject(err),
    });
  });
};

// ==========================
// 🟢 LOGOUT
// ==========================
export const logout = () => {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
};